import {
  FormTemplate,
  FormField,
  FormData,
  FormValidationResult,
  FormBuilderConfig,
  ExportOptions,
  ImportOptions,
  FormSubmission,
  FormAnalytics,
  TemplateCategory,
  ComponentLibrary,
} from '../types/formBuilder';

export class FormBuilderService {
  private config: FormBuilderConfig;
  private templates: Map<string, FormTemplate>;
  private submissions: Map<string, FormSubmission[]>;
  private analytics: Map<string, FormAnalytics>;
  private componentLibrary: ComponentLibrary;

  constructor(config: FormBuilderConfig) {
    this.config = config;
    this.templates = new Map();
    this.submissions = new Map();
    this.analytics = new Map();
    this.componentLibrary = this.initializeComponentLibrary();
    this.initializeDefaultTemplates();
  }

  /**
   * Save form template
   */
  async saveTemplate(template: FormTemplate): Promise<boolean> {
    try {
      // Validate template
      const validation = this.validateTemplate(template);
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.summary}`);
      }

      // Update timestamps
      template.updatedAt = new Date();
      if (!template.createdAt) {
        template.createdAt = new Date();
      }

      // Save to storage (simplified - would use actual database)
      this.templates.set(template.id, template);
      
      console.log(`Template saved: ${template.id} - ${template.name}`);
      return true;
    } catch (error) {
      console.error('Failed to save template:', error);
      return false;
    }
  }

  /**
   * Load form template
   */
  async loadTemplate(templateId: string): Promise<FormTemplate | null> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        console.warn(`Template not found: ${templateId}`);
        return null;
      }
      
      return template;
    } catch (error) {
      console.error('Failed to load template:', error);
      return null;
    }
  }

  /**
   * Delete form template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const deleted = this.templates.delete(templateId);
      if (deleted) {
        // Clean up related data
        this.submissions.delete(templateId);
        this.analytics.delete(templateId);
        console.log(`Template deleted: ${templateId}`);
      }
      return deleted;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<FormTemplate[]> {
    try {
      return Array.from(this.templates.values());
    } catch (error) {
      console.error('Failed to get all templates:', error);
      return [];
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<FormTemplate[]> {
    try {
      return Array.from(this.templates.values()).filter(template => template.category === category);
    } catch (error) {
      console.error('Failed to get templates by category:', error);
      return [];
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string): Promise<FormTemplate[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return Array.from(this.templates.values()).filter(template =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Failed to search templates:', error);
      return [];
    }
  }

  /**
   * Validate form template
   */
  validateTemplate(template: FormTemplate): FormValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Basic validation
    if (!template.name || template.name.trim() === '') {
      errors.push({
        fieldId: 'name',
        fieldName: 'name',
        message: 'Template name is required',
        type: 'required',
        value: template.name,
      });
    }

    if (!template.fields || template.fields.length === 0) {
      warnings.push({
        fieldId: 'fields',
        fieldName: 'fields',
        message: 'Template has no fields',
        type: 'warning',
        value: template.fields?.length || 0,
      });
    }

    // Validate fields
    template.fields.forEach((field, index) => {
      if (!field.name || field.name.trim() === '') {
        errors.push({
          fieldId: field.id,
          fieldName: field.name,
          message: `Field ${index + 1} has no name`,
          type: 'required',
          value: field.name,
        });
      }

      if (!field.label || field.label.trim() === '') {
        warnings.push({
          fieldId: field.id,
          fieldName: field.name,
          message: `Field ${field.name} has no label`,
          type: 'warning',
          value: field.label,
        });
      }

      if (field.required && !field.validation?.some(v => v.type === 'required')) {
        warnings.push({
          fieldId: field.id,
          fieldName: field.name,
          message: `Required field ${field.name} has no required validation`,
          type: 'warning',
          value: field.name,
        });
      }

      // Validate field-specific requirements
      if ((field.type === 'select' || field.type === 'multiselect' || field.type === 'radio') && 
          (!field.options || field.options.length === 0)) {
        errors.push({
          fieldId: field.id,
          fieldName: field.name,
          message: `Selection field ${field.name} has no options`,
          type: 'required',
          value: field.options?.length || 0,
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: errors.length === 0 
        ? 'Template is valid' 
        : `Template has ${errors.length} error(s)${warnings.length > 0 ? ` and ${warnings.length} warning(s)` : ''}`,
    };
  }

  /**
   * Duplicate form template
   */
  async duplicateTemplate(templateId: string, newName?: string): Promise<FormTemplate | null> {
    try {
      const originalTemplate = await this.loadTemplate(templateId);
      if (!originalTemplate) {
        throw new Error('Original template not found');
      }

      const duplicatedTemplate: FormTemplate = {
        ...originalTemplate,
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newName || `${originalTemplate.name} (Copy)`,
        description: `${originalTemplate.description} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current_user',
        isPublic: false,
        isPublished: false,
      };

      // Deep copy fields to avoid reference issues
      duplicatedTemplate.fields = originalTemplate.fields.map(field => ({
        ...field,
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }));

      const success = await this.saveTemplate(duplicatedTemplate);
      return success ? duplicatedTemplate : null;
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      return null;
    }
  }

  /**
   * Publish form template
   */
  async publishTemplate(templateId: string): Promise<boolean> {
    try {
      const template = await this.loadTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      template.isPublished = true;
      template.updatedAt = new Date();

      return await this.saveTemplate(template);
    } catch (error) {
      console.error('Failed to publish template:', error);
      return false;
    }
  }

  /**
   * Unpublish form template
   */
  async unpublishTemplate(templateId: string): Promise<boolean> {
    try {
      const template = await this.loadTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      template.isPublished = false;
      template.updatedAt = new Date();

      return await this.saveTemplate(template);
    } catch (error) {
      console.error('Failed to unpublish template:', error);
      return false;
    }
  }

  /**
   * Submit form data
   */
  async submitForm(templateId: string, data: FormData, metadata?: any): Promise<FormSubmission> {
    try {
      const template = await this.loadTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const submission: FormSubmission = {
        id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        formId: templateId,
        templateId: template.id,
        data,
        status: 'submitted',
        submittedAt: new Date(),
        metadata: metadata || {},
      };

      // Save submission (simplified - would use actual database)
      const submissions = this.submissions.get(templateId) || [];
      submissions.push(submission);
      this.submissions.set(templateId, submissions);

      // Update analytics
      await this.updateAnalytics(templateId, submission);

      console.log(`Form submitted: ${submission.id} for template ${templateId}`);
      return submission;
    } catch (error) {
      console.error('Failed to submit form:', error);
      throw error;
    }
  }

  /**
   * Get form submissions
   */
  async getSubmissions(templateId: string, limit?: number): Promise<FormSubmission[]> {
    try {
      const submissions = this.submissions.get(templateId) || [];
      const sortedSubmissions = submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
      
      return limit ? sortedSubmissions.slice(0, limit) : sortedSubmissions;
    } catch (error) {
      console.error('Failed to get submissions:', error);
      return [];
    }
  }

  /**
   * Get form analytics
   */
  async getAnalytics(templateId: string, timeRange?: { start: Date; end: Date }): Promise<FormAnalytics | null> {
    try {
      const analytics = this.analytics.get(templateId);
      if (!analytics) {
        return null;
      }

      const submissions = await this.getSubmissions(templateId);
      const filteredSubmissions = timeRange 
        ? submissions.filter(s => s.submittedAt >= timeRange.start && s.submittedAt <= timeRange.end)
        : submissions;

      // Calculate metrics
      const totalViews = Math.floor(Math.random() * 1000) + 100; // Simulated
      const totalCompletions = filteredSubmissions.length;
      const totalAbandonments = Math.floor(totalViews * 0.3); // Simulated
      const avgCompletionTime = filteredSubmissions.reduce((sum, s) => {
        // Calculate completion time from metadata (simplified)
        return sum + (s.metadata?.completionTime || 0);
      }, 0) / filteredSubmissions.length;

      const updatedAnalytics: FormAnalytics = {
        ...analytics,
        period: timeRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        metrics: {
          totalViews,
          totalSubmissions: filteredSubmissions.length,
          totalCompletions,
          totalAbandonments,
          averageCompletionTime: avgCompletionTime,
          avgTimePerField: {},
          fieldInteractions: {},
          fieldErrors: {},
          fieldFocusTime: {},
          conversionRate: totalViews > 0 ? totalCompletions / totalViews : 0,
          abandonmentRate: totalViews > 0 ? totalAbandonments / totalViews : 0,
          errorRate: 0, // Would calculate from validation errors
        },
        breakdown: {
          byDevice: {},
          byBrowser: {},
          bySource: {},
          byUTMCampaign: {},
          byTimeOfDay: {},
          byDayOfWeek: {},
        },
        trends: {
          submissions: [],
          completionRate: [],
          abandonmentRate: [],
          averageTime: [],
        },
      };

      this.analytics.set(templateId, updatedAnalytics);
      return updatedAnalytics;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }

  /**
   * Export form template
   */
  async exportTemplate(templateId: string, options: ExportOptions): Promise<string> {
    try {
      const template = await this.loadTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const exportData: any = {
        template,
        version: '1.0',
        exportedAt: new Date().toISOString(),
        exportedBy: 'current_user',
        options,
      };

      if (options.includeAnalytics) {
        exportData.analytics = await this.getAnalytics(templateId);
      }

      if (options.includeSubmissions) {
        exportData.submissions = await this.getSubmissions(templateId);
      }

      let result: string;
      
      switch (options.format) {
        case 'json':
          result = JSON.stringify(exportData, null, 2);
          break;
        case 'xml':
          result = this.convertToXML(exportData);
          break;
        case 'yaml':
          result = this.convertToYAML(exportData);
          break;
        case 'csv':
          result = this.convertToCSV(exportData);
          break;
        default:
          result = JSON.stringify(exportData, null, 2);
      }

      if (options.compress) {
        // Would implement compression here
        console.log('Compression not implemented yet');
      }

      console.log(`Template exported: ${templateId} in ${options.format} format`);
      return result;
    } catch (error) {
      console.error('Failed to export template:', error);
      throw error;
    }
  }

  /**
   * Import form template
   */
  async importTemplate(data: string, options: ImportOptions): Promise<FormTemplate> {
    try {
      let importData: any;

      switch (options.format) {
        case 'json':
          importData = JSON.parse(data);
          break;
        case 'xml':
          importData = this.parseFromXML(data);
          break;
        case 'yaml':
          importData = this.parseFromYAML(data);
          break;
        case 'csv':
          importData = this.parseFromCSV(data);
          break;
        default:
          importData = JSON.parse(data);
      }

      // Validate import data
      if (!importData.template) {
        throw new Error('Invalid import data format');
      }

      let template: FormTemplate = importData.template;

      // Apply merge strategy
      if (options.mergeStrategy === 'merge') {
        const existingTemplate = await this.loadTemplate(template.id);
        if (existingTemplate) {
          template = this.mergeTemplates(existingTemplate, template);
        }
      }

      // Validate imported template
      if (options.validateSchema) {
        const validation = this.validateTemplate(template);
        if (!validation.isValid) {
          throw new Error(`Import validation failed: ${validation.summary}`);
        }
      }

      // Generate new IDs if not preserving
      if (!options.preserveIds) {
        template.id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        template.fields = template.fields.map(field => ({
          ...field,
          id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }));
      }

      // Set metadata
      template.createdAt = new Date();
      template.updatedAt = new Date();
      template.createdBy = 'imported';

      // Save imported template
      const success = await this.saveTemplate(template);
      if (!success) {
        throw new Error('Failed to save imported template');
      }

      // Import related data
      if (options.importAnalytics && importData.analytics) {
        this.analytics.set(template.id, importData.analytics);
      }

      if (options.importSubmissions && importData.submissions) {
        this.submissions.set(template.id, importData.submissions);
      }

      console.log(`Template imported: ${template.id} from ${options.format} format`);
      return template;
    } catch (error) {
      console.error('Failed to import template:', error);
      throw error;
    }
  }

  /**
   * Get component library
   */
  getComponentLibrary(): ComponentLibrary {
    return this.componentLibrary;
  }

  /**
   * Get template categories
   */
  getTemplateCategories(): TemplateCategory[] {
    return [
      {
        id: 'forms',
        name: 'Forms',
        description: 'General purpose forms',
        icon: 'description',
        color: '#6C5CE7',
        order: 1,
        isDefault: true,
      },
      {
        id: 'surveys',
        name: 'Surveys',
        description: 'Survey and feedback forms',
        icon: 'poll',
        color: '#4ECDC4',
        order: 2,
        isDefault: false,
      },
      {
        id: 'applications',
        name: 'Applications',
        description: 'Job and application forms',
        icon: 'work',
        color: '#FFA500',
        order: 3,
        isDefault: false,
      },
      {
        id: 'registrations',
        name: 'Registrations',
        description: 'Event and registration forms',
        icon: 'event',
        color: '#FF6B6B',
        order: 4,
        isDefault: false,
      },
      {
        id: 'contacts',
        name: 'Contacts',
        description: 'Contact and inquiry forms',
        icon: 'contact',
        color: '#9B59B6',
        order: 5,
        isDefault: false,
      },
      {
        id: 'feedback',
        name: 'Feedback',
        description: 'Feedback and review forms',
        icon: 'rate-review',
        color: '#8E44AD',
        order: 6,
        isDefault: false,
      },
      {
        id: 'orders',
        name: 'Orders',
        description: 'Order and purchase forms',
        icon: 'shopping-cart',
        color: '#E91E63',
        order: 7,
        isDefault: false,
      },
      {
        id: 'custom',
        name: 'Custom',
        description: 'Custom form templates',
        icon: 'extension',
        color: '#795548',
        order: 8,
        isDefault: false,
      },
    ];
  }

  // Private helper methods

  private initializeComponentLibrary(): ComponentLibrary {
    // This would initialize the complete component library
    // For now, return a basic structure
    return {
      fieldTypes: [],
      validationTypes: [],
      conditionalOperators: [],
      templates: this.getTemplateCategories(),
    };
  }

  private initializeDefaultTemplates(): void {
    // Create some default templates
    const defaultTemplates: FormTemplate[] = [
      {
        id: 'contact_form',
        name: 'Contact Form',
        description: 'Basic contact form with name, email, and message',
        version: '1.0.0',
        category: 'contacts',
        tags: ['contact', 'basic'],
        fields: [
          {
            id: 'field_name',
            type: 'text',
            name: 'name',
            label: 'Name',
            placeholder: 'Enter your name',
            required: true,
            disabled: false,
            defaultValue: '',
            options: [],
            validation: [
              {
                type: 'required',
                message: 'Name is required',
                enabled: true,
              },
              {
                type: 'minLength',
                message: 'Name must be at least 2 characters',
                parameters: { min: 2 },
                enabled: true,
              },
            ],
            styling: {},
            metadata: {},
            order: 0,
          },
          {
            id: 'field_email',
            type: 'email',
            name: 'email',
            label: 'Email',
            placeholder: 'Enter your email',
            required: true,
            disabled: false,
            defaultValue: '',
            options: [],
            validation: [
              {
                type: 'required',
                message: 'Email is required',
                enabled: true,
              },
              {
                type: 'email',
                message: 'Please enter a valid email address',
                enabled: true,
              },
            ],
            styling: {},
            metadata: {},
            order: 1,
          },
          {
            id: 'field_message',
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Enter your message',
            required: true,
            disabled: false,
            defaultValue: '',
            options: [],
            validation: [
              {
                type: 'required',
                message: 'Message is required',
                enabled: true,
              },
              {
                type: 'minLength',
                message: 'Message must be at least 10 characters',
                parameters: { min: 10 },
                enabled: true,
              },
            ],
            styling: {},
            metadata: {},
            order: 2,
          },
        ],
        groups: [],
        settings: {
          title: 'Contact Us',
          description: 'Get in touch with us',
          submitButtonText: 'Send Message',
          showProgressBar: false,
          showValidationSummary: true,
          enableAutoSave: false,
          enableRealTimeValidation: true,
          enableMultiStep: false,
          stepNavigation: 'horizontal',
          showStepNumbers: true,
          allowPreviousStep: true,
          submitOnEnter: false,
          resetOnSubmit: false,
          styling: {
            theme: 'light',
            primaryColor: '#6C5CE7',
            secondaryColor: '#4ECDC4',
            backgroundColor: '#FFFFFF',
            textColor: '#2C3E50',
            borderColor: '#E0E0E0',
            errorColor: '#FF6B6B',
            successColor: '#6BCF7F',
            warningColor: '#FFA500',
            borderRadius: 8,
            spacing: 16,
            fontSize: 16,
            fontFamily: 'System',
          },
          analytics: {
            enabled: true,
            trackFieldInteractions: true,
            trackFormAbandonment: true,
            trackCompletionTime: true,
            trackValidationErrors: true,
            trackFieldFocusTime: false,
            anonymizeData: true,
            retentionDays: 30,
          },
          notifications: {
            onSubmit: { enabled: false, type: 'webhook', recipients: [], template: '' },
            onValidationError: { enabled: false, type: 'inapp', recipients: [], template: '' },
            onFormAbandoned: { enabled: false, type: 'inapp', recipients: [], template: '' },
            onStepCompleted: { enabled: false, type: 'inapp', recipients: [], template: '' },
            onFieldChanged: { enabled: false, type: 'inapp', recipients: [], template: '' },
          },
          security: {
            enableCSRFProtection: true,
            enableRateLimiting: true,
            rateLimitPerMinute: 10,
            enableEncryption: true,
            allowedDomains: [],
            blockSuspiciousIPs: true,
            logSecurityEvents: true,
          },
        },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        isPublic: true,
        isPublished: true,
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private mergeTemplates(existing: FormTemplate, imported: FormTemplate): FormTemplate {
    // Merge logic for combining templates
    return {
      ...existing,
      ...imported,
      fields: [...existing.fields, ...imported.fields],
      groups: [...existing.groups, ...imported.groups],
      settings: { ...existing.settings, ...imported.settings },
      metadata: { ...existing.metadata, ...imported.metadata },
      updatedAt: new Date(),
    };
  }

  private async updateAnalytics(templateId: string, submission: FormSubmission): Promise<void> {
    // Update analytics based on submission
    const existingAnalytics = this.analytics.get(templateId);
    
    if (existingAnalytics) {
      // Update metrics (simplified)
      existingAnalytics.metrics.totalSubmissions++;
      
      this.analytics.set(templateId, existingAnalytics);
    }
  }

  private convertToXML(data: any): string {
    // Simplified XML conversion
    return `<?xml version="1.0" encoding="UTF-8"?>
<formBuilder>
  <template>${JSON.stringify(data.template)}</template>
  <exportedAt>${data.exportedAt}</exportedAt>
</formBuilder>`;
  }

  private convertToYAML(data: any): string {
    // Simplified YAML conversion
    return `template: ${JSON.stringify(data.template, null, 2)}
exportedAt: ${data.exportedAt}`;
  }

  private convertToCSV(data: any): string {
    // Simplified CSV conversion
    return 'id,name,description,category\n' + 
           `${data.template.id},${data.template.name},${data.template.description},${data.template.category}`;
  }

  private parseFromXML(data: string): any {
    // Simplified XML parsing
    return JSON.parse(data.match(/<template>(.*?)<\/template>/)?.[1] || '{}');
  }

  private parseFromYAML(data: string): any {
    // Simplified YAML parsing
    return JSON.parse(data.match(/template: (.*)/)?.[1] || '{}');
  }

  private parseFromCSV(data: string): any {
    // Simplified CSV parsing
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const values = lines[1].split(',');
    
    return {
      template: {
        id: values[0],
        name: values[1],
        description: values[2],
        category: values[3],
      },
    };
  }
}

// Singleton instance
let formBuilderService: FormBuilderService | null = null;

export const getFormBuilderService = (config: FormBuilderConfig): FormBuilderService => {
  if (!formBuilderService) {
    formBuilderService = new FormBuilderService(config);
  }
  return formBuilderService;
};

// Export utility functions
export const createFormBuilderService = (config: FormBuilderConfig): FormBuilderService => {
  return new FormBuilderService(config);
};

export const validateFormTemplate = (template: FormTemplate): FormValidationResult => {
  const service = new FormBuilderService({} as FormBuilderConfig);
  return service.validateTemplate(template);
};

export const exportFormTemplate = async (
  templateId: string,
  options: ExportOptions,
  config: FormBuilderConfig
): Promise<string> => {
  const service = getFormBuilderService(config);
  return service.exportTemplate(templateId, options);
};

export const importFormTemplate = async (
  data: string,
  options: ImportOptions,
  config: FormBuilderConfig
): Promise<FormTemplate> => {
  const service = getFormBuilderService(config);
  return service.importTemplate(data, options);
};

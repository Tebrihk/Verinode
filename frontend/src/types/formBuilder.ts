export interface FormField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  disabled: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationRule[];
  conditional?: ConditionalRule;
  styling?: FieldStyling;
  metadata?: Record<string, any>;
  order: number;
  groupId?: string;
}

export interface FieldOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
  icon?: string;
  color?: string;
}

export interface ValidationRule {
  type: ValidationType;
  message: string;
  parameters?: Record<string, any>;
  customFunction?: string;
  enabled: boolean;
}

export interface ConditionalRule {
  type: ConditionalType;
  conditions: Condition[];
  action: ConditionalAction;
  enabled: boolean;
}

export interface Condition {
  fieldId: string;
  operator: ConditionalOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ConditionalAction {
  type: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional' | 'setValue' | 'addOption' | 'removeOption';
  targetFieldId: string;
  value?: any;
  options?: FieldOption[];
}

export interface FieldStyling {
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'light' | 'medium';
  textAlign?: 'left' | 'center' | 'right';
  padding?: string | number;
  margin?: string | number;
  customCSS?: string;
}

export interface FieldGroup {
  id: string;
  name: string;
  title: string;
  description?: string;
  collapsed: boolean;
  order: number;
  styling?: FieldStyling;
  conditional?: ConditionalRule;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  fields: FormField[];
  groups: FieldGroup[];
  settings: FormSettings;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublic: boolean;
  isPublished: boolean;
}

export interface FormSettings {
  title: string;
  description?: string;
  submitButtonText: string;
  cancelButtonText?: string;
  resetButtonText?: string;
  showProgressBar: boolean;
  showValidationSummary: boolean;
  enableAutoSave: boolean;
  enableRealTimeValidation: boolean;
  enableMultiStep: boolean;
  stepNavigation: 'horizontal' | 'vertical';
  showStepNumbers: boolean;
  allowPreviousStep: boolean;
  submitOnEnter: boolean;
  resetOnSubmit: boolean;
  styling: FormStyling;
  analytics: AnalyticsSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

export interface FormStyling {
  theme: 'light' | 'dark' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  errorColor: string;
  successColor: string;
  warningColor: string;
  borderRadius: number;
  spacing: number;
  fontSize: number;
  fontFamily: string;
  customCSS?: string;
}

export interface AnalyticsSettings {
  enabled: boolean;
  trackFieldInteractions: boolean;
  trackFormAbandonment: boolean;
  trackCompletionTime: boolean;
  trackValidationErrors: boolean;
  trackFieldFocusTime: boolean;
  anonymizeData: boolean;
  retentionDays: number;
}

export interface NotificationSettings {
  onSubmit: NotificationConfig;
  onValidationError: NotificationConfig;
  onFormAbandoned: NotificationConfig;
  onStepCompleted: NotificationConfig;
  onFieldChanged: NotificationConfig;
}

export interface NotificationConfig {
  enabled: boolean;
  type: 'email' | 'push' | 'webhook' | 'inapp';
  recipients: string[];
  template: string;
  subject?: string;
  webhookUrl?: string;
  customData?: Record<string, any>;
}

export interface SecuritySettings {
  enableCSRFProtection: boolean;
  enableRateLimiting: boolean;
  rateLimitPerMinute: number;
  enableEncryption: boolean;
  allowedDomains: string[];
  blockSuspiciousIPs: boolean;
  logSecurityEvents: boolean;
}

export interface FormData {
  [key: string]: any;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
  warnings: FieldValidationWarning[];
  summary: string;
}

export interface FieldValidationError {
  fieldId: string;
  fieldName: string;
  message: string;
  type: ValidationType;
  value: any;
}

export interface FieldValidationWarning {
  fieldId: string;
  fieldName: string;
  message: string;
  type: ValidationType;
  value: any;
}

export interface FormSubmission {
  id: string;
  formId: string;
  templateId: string;
  data: FormData;
  status: 'pending' | 'submitted' | 'processing' | 'completed' | 'failed';
  submittedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  processingTime?: number;
  errors?: string[];
  metadata?: Record<string, any>;
}

export interface FormAnalytics {
  id: string;
  formId: string;
  templateId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalViews: number;
    totalSubmissions: number;
    totalCompletions: number;
    totalAbandonments: number;
    averageCompletionTime: number;
    averageTimePerField: Record<string, number>;
    fieldInteractions: Record<string, number>;
    fieldErrors: Record<string, number>;
    fieldFocusTime: Record<string, number>;
    conversionRate: number;
    abandonmentRate: number;
    errorRate: number;
  };
  breakdown: {
    byDevice: Record<string, number>;
    byBrowser: Record<string, number>;
    bySource: Record<string, number>;
    byUTMCampaign: Record<string, number>;
    byTimeOfDay: Record<string, number>;
    byDayOfWeek: Record<string, number>;
  };
  trends: {
    submissions: TrendData[];
    completionRate: TrendData[];
    abandonmentRate: TrendData[];
    averageTime: TrendData[];
  };
}

export interface TrendData {
  date: string;
  value: number;
  change?: number;
  changePercent?: number;
}

export interface FormBuilderState {
  template: FormTemplate | null;
  selectedField: FormField | null;
  draggedField: FormField | null;
  previewMode: boolean;
  validationMode: boolean;
  isDirty: boolean;
  errors: string[];
  warnings: string[];
  activeStep: number;
  formData: FormData;
  validationResult: FormValidationResult | null;
  isSubmitting: boolean;
  submissionResult: FormSubmission | null;
}

// Field Types
export type FieldType = 
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'slider'
  | 'range'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'image'
  | 'video'
  | 'audio'
  | 'rating'
  | 'color'
  | 'hidden'
  | 'divider'
  | 'header'
  | 'paragraph'
  | 'button'
  | 'signature'
  | 'calculation'
  | 'lookup'
  | 'custom';

// Validation Types
export type ValidationType = 
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'email'
  | 'url'
  | 'phone'
  | 'number'
  | 'integer'
  | 'decimal'
  | 'positive'
  | 'negative'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'image'
  | 'video'
  | 'audio'
  | 'custom';

// Conditional Types
export type ConditionalType = 
  | 'show'
  | 'hide'
  | 'enable'
  | 'disable'
  | 'require'
  | 'optional'
  | 'setValue'
  | 'addOption'
  | 'removeOption';

export type ConditionalOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isChecked'
  | 'isUnchecked'
  | 'in'
  | 'notIn'
  | 'between'
  | 'notBetween'
  | 'matches'
  | 'notMatches';

// Drag and Drop Types
export interface DragItem {
  type: 'field' | 'group';
  data: FormField | FieldGroup;
}

export interface DropTarget {
  groupId?: string;
  index: number;
  type: 'field' | 'group';
}

export interface DragResult {
  source: DragItem;
  target: DropTarget;
  position: 'before' | 'after' | 'inside';
}

// Builder Configuration
export interface FormBuilderConfig {
  enabledFieldTypes: FieldType[];
  enabledValidationTypes: ValidationType[];
  enabledConditionalOperators: ConditionalOperator[];
  maxFieldsPerForm: number;
  maxGroupsPerForm: number;
  maxOptionsPerSelect: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  enableRealTimePreview: boolean;
  enableAutoSave: boolean;
  autoSaveInterval: number;
  enableAnalytics: boolean;
  enableCollaboration: boolean;
  enableVersioning: boolean;
  enableExport: boolean;
  enableImport: boolean;
  enableTemplates: boolean;
  enableCustomFields: boolean;
  enableCustomValidation: boolean;
  enableCustomComponents: boolean;
}

// Template Categories
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isDefault: boolean;
}

// Component Library
export interface ComponentLibrary {
  fieldTypes: FieldTypeDefinition[];
  validationTypes: ValidationTypeDefinition[];
  conditionalOperators: ConditionalOperatorDefinition[];
  templates: TemplateCategory[];
}

export interface FieldTypeDefinition {
  type: FieldType;
  name: string;
  description: string;
  icon: string;
  category: string;
  group: string;
  defaultValue: any;
  properties: FieldPropertyDefinition[];
  validations: ValidationTypeDefinition[];
  styling: FieldStylingDefinition[];
  supportedFeatures: string[];
}

export interface FieldPropertyDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'select' | 'color' | 'date';
  label: string;
  description: string;
  required: boolean;
  defaultValue: any;
  options?: Array<{ label: string; value: any }>;
  validation?: ValidationRule[];
  group?: string;
  order: number;
}

export interface ValidationTypeDefinition {
  type: ValidationType;
  name: string;
  description: string;
  applicableFieldTypes: FieldType[];
  parameters: ValidationParameterDefinition[];
  defaultMessage: string;
}

export interface ValidationParameterDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean';
  label: string;
  description: string;
  required: boolean;
  defaultValue: any;
  validation?: ValidationRule[];
}

export interface ConditionalOperatorDefinition {
  operator: ConditionalOperator;
  name: string;
  description: string;
  applicableFieldTypes: FieldType[];
  valueType: 'string' | 'number' | 'boolean' | 'array';
  requiresValue: boolean;
}

export interface FieldStylingDefinition {
  property: string;
  type: 'color' | 'size' | 'spacing' | 'border' | 'typography';
  label: string;
  description: string;
  applicableFieldTypes: FieldType[];
  defaultValue: any;
}

// Form Builder Events
export interface FormBuilderEvent {
  type: 'fieldAdded' | 'fieldRemoved' | 'fieldUpdated' | 'fieldMoved' | 'groupAdded' | 'groupRemoved' | 'groupUpdated' | 'formSaved' | 'formLoaded' | 'formValidated' | 'formSubmitted';
  timestamp: Date;
  data: any;
  userId?: string;
}

// Collaboration Types
export interface FormCollaboration {
  id: string;
  formId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: string[];
  isActive: boolean;
  lastActivity: Date;
  cursor?: {
    fieldId: string;
    position: number;
  };
}

export interface FormComment {
  id: string;
  formId: string;
  fieldId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

// Version Control
export interface FormVersion {
  id: string;
  formId: string;
  version: string;
  name: string;
  description: string;
  template: FormTemplate;
  createdAt: Date;
  createdBy: string;
  changes: FormChange[];
  isCurrent: boolean;
}

export interface FormChange {
  type: 'add' | 'remove' | 'update' | 'move';
  target: string;
  targetId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  userId: string;
}

// Export/Import Types
export interface ExportOptions {
  format: 'json' | 'xml' | 'yaml' | 'csv';
  includeAnalytics: boolean;
  includeVersions: boolean;
  includeComments: boolean;
  includeCollaboration: boolean;
  compress: boolean;
  password?: string;
}

export interface ImportOptions {
  format: 'json' | 'xml' | 'yaml' | 'csv';
  mergeStrategy: 'replace' | 'merge' | 'append';
  validateSchema: boolean;
  preserveIds: boolean;
  importAnalytics: boolean;
  importVersions: boolean;
  importComments: boolean;
  importCollaboration: boolean;
}

// Mobile-Specific Types
export interface MobileFormSettings {
  enableNativeKeyboard: boolean;
  enableNativeDatePicker: boolean;
  enableNativeFilePicker: boolean;
  enableNativeCamera: boolean;
  enableNativeLocation: boolean;
  enablePushNotifications: boolean;
  enableOfflineMode: boolean;
  enableBiometricAuth: boolean;
  enableVoiceInput: boolean;
  enableGestureControls: boolean;
  optimizeForTouch: boolean;
  enableHapticFeedback: boolean;
}

export interface MobileFormLayout {
  type: 'single-column' | 'two-column' | 'tabs' | 'accordion' | 'wizard';
  headerHeight: number;
  footerHeight: number;
  padding: number;
  spacing: number;
  scrollBehavior: 'normal' | 'snap' | 'sticky';
  keyboardBehavior: 'resize' | 'pan' | 'none';
}

// Accessibility Types
export interface AccessibilitySettings {
  enableScreenReader: boolean;
  enableHighContrast: boolean;
  enableLargeText: boolean;
  enableReducedMotion: boolean;
  enableFocusManagement: boolean;
  enableKeyboardNavigation: boolean;
  enableVoiceControl: boolean;
  customAriaLabels: Record<string, string>;
  customRoles: Record<string, string>;
  customDescriptions: Record<string, string>;
}

// Integration Types
export interface FormIntegration {
  id: string;
  type: 'webhook' | 'api' | 'database' | 'email' | 'sms' | 'crm' | 'analytics' | 'payment' | 'storage';
  name: string;
  description: string;
  configuration: Record<string, any>;
  enabled: boolean;
  triggers: string[];
  mapping: Record<string, string>;
  authentication?: {
    type: 'bearer' | 'basic' | 'api_key' | 'oauth2';
    credentials: Record<string, string>;
  };
}

// Error Types
export interface FormBuilderError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  formId?: string;
  fieldId?: string;
}

// Utility Types
export interface FormBuilderConfig {
  apiEndpoint: string;
  apiKey?: string;
  enableRealTime: boolean;
  enableWebSocket: boolean;
  enableAnalytics: boolean;
  enableCollaboration: boolean;
  enableVersioning: boolean;
  enableTemplates: boolean;
  enableCustomFields: boolean;
  enableCustomValidation: boolean;
  enableCustomComponents: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  autoSaveInterval: number;
  previewUpdateInterval: number;
  validationDebounceMs: number;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

// Hook Types
export interface UseFormBuilderReturn {
  template: FormTemplate | null;
  selectedField: FormField | null;
  previewMode: boolean;
  isDirty: boolean;
  errors: string[];
  warnings: string[];
  addField: (field: FormField) => void;
  removeField: (fieldId: string) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  moveField: (fieldId: string, targetIndex: number) => void;
  duplicateField: (fieldId: string) => void;
  validateForm: () => FormValidationResult;
  saveTemplate: () => Promise<boolean>;
  loadTemplate: (templateId: string) => Promise<boolean>;
  exportTemplate: (options: ExportOptions) => Promise<string>;
  importTemplate: (data: string, options: ImportOptions) => Promise<boolean>;
  resetForm: () => void;
  undo: () => void;
  redo: () => void;
}

// Context Types
export interface FormBuilderContextType {
  state: FormBuilderState;
  config: FormBuilderConfig;
  componentLibrary: ComponentLibrary;
  dispatch: React.Dispatch<FormBuilderAction>;
  actions: UseFormBuilderReturn;
}

// Action Types
export type FormBuilderAction =
  | { type: 'SET_TEMPLATE'; payload: FormTemplate }
  | { type: 'ADD_FIELD'; payload: FormField }
  | { type: 'REMOVE_FIELD'; payload: string }
  | { type: 'UPDATE_FIELD'; payload: { fieldId: string; updates: Partial<FormField> } }
  | { type: 'MOVE_FIELD'; payload: { fieldId: string; targetIndex: number } }
  | { type: 'SELECT_FIELD'; payload: FormField | null }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'SET_VALIDATION_MODE'; payload: boolean }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'ADD_WARNING'; payload: string }
  | { type: 'REMOVE_WARNING'; payload: string }
  | { type: 'SET_FORM_DATA'; payload: FormData }
  | { type: 'SET_VALIDATION_RESULT'; payload: FormValidationResult }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_SUBMISSION_RESULT'; payload: FormSubmission | null }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_TEMPLATE'; payload: FormTemplate }
  | { type: 'SAVE_TEMPLATE' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

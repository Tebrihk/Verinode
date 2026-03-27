import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { DragList } from 'react-native-draglist';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  FormField,
  FieldGroup,
  FormTemplate,
  FormBuilderState,
  DragItem,
  DropTarget,
  DragResult,
  FormBuilderConfig,
  UseFormBuilderReturn,
} from '../../types/formBuilder';
import FieldLibrary from './FieldLibrary';
import FormPreview from './FormPreview';
import ValidationRules from './ValidationRules';
import ConditionalLogic from './ConditionalLogic';
import { getFormBuilderService } from '../../services/formBuilderService';

interface FormBuilderProps {
  config: FormBuilderConfig;
  initialTemplate?: FormTemplate;
  onSave?: (template: FormTemplate) => Promise<boolean>;
  onPreview?: (template: FormTemplate) => void;
  onFieldSelect?: (field: FormField | null) => void;
  onValidationChange?: (result: any) => void;
  style?: any;
}

const { width, height } = Dimensions.get('window');

export const FormBuilder: React.FC<FormBuilderProps> = ({
  config,
  initialTemplate,
  onSave,
  onPreview,
  onFieldSelect,
  onValidationChange,
  style,
}) => {
  const [state, setState] = useState<FormBuilderState>({
    template: initialTemplate || createEmptyTemplate(),
    selectedField: null,
    draggedField: null,
    previewMode: false,
    validationMode: false,
    isDirty: false,
    errors: [],
    warnings: [],
    activeStep: 0,
    formData: {},
    validationResult: null,
    isSubmitting: false,
    submissionResult: null,
  });

  const [showFieldLibrary, setShowFieldLibrary] = useState(false);
  const [showValidationRules, setShowValidationRules] = useState(false);
  const [showConditionalLogic, setShowConditionalLogic] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const formBuilderService = getFormBuilderService(config);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (initialTemplate) {
      setState(prev => ({
        ...prev,
        template: initialTemplate,
        isDirty: false,
      }));
    }
  }, [initialTemplate]);

  // Form Builder Actions
  const addField = useCallback((field: FormField) => {
    setState(prev => {
      const updatedTemplate = {
        ...prev.template!,
        fields: [...prev.template!.fields, field],
        updatedAt: new Date(),
      };
      
      return {
        ...prev,
        template: updatedTemplate,
        isDirty: true,
        errors: [],
      };
    });
  }, []);

  const removeField = useCallback((fieldId: string) => {
    Alert.alert(
      'Remove Field',
      'Are you sure you want to remove this field?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setState(prev => {
              const updatedTemplate = {
                ...prev.template!,
                fields: prev.template!.fields.filter(f => f.id !== fieldId),
                updatedAt: new Date(),
              };
              
              return {
                ...prev,
                template: updatedTemplate,
                selectedField: prev.selectedField?.id === fieldId ? null : prev.selectedField,
                isDirty: true,
              };
            });
          },
        },
      ]
    );
  }, []);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setState(prev => {
      const updatedTemplate = {
        ...prev.template!,
        fields: prev.template!.fields.map(f =>
          f.id === fieldId ? { ...f, ...updates } : f
        ),
        updatedAt: new Date(),
      };
      
      return {
        ...prev,
        template: updatedTemplate,
        selectedField: prev.selectedField?.id === fieldId ? { ...prev.selectedField, ...updates } : prev.selectedField,
        isDirty: true,
      };
    });
  }, []);

  const moveField = useCallback((fieldId: string, targetIndex: number) => {
    setState(prev => {
      const fields = [...prev.template!.fields];
      const fieldIndex = fields.findIndex(f => f.id === fieldId);
      
      if (fieldIndex === -1) return prev;
      
      const [movedField] = fields.splice(fieldIndex, 1);
      fields.splice(targetIndex, 0, movedField);
      
      // Update order for all fields
      fields.forEach((field, index) => {
        field.order = index;
      });
      
      const updatedTemplate = {
        ...prev.template!,
        fields,
        updatedAt: new Date(),
      };
      
      return {
        ...prev,
        template: updatedTemplate,
        isDirty: true,
      };
    });
  }, []);

  const duplicateField = useCallback((fieldId: string) => {
    setState(prev => {
      const originalField = prev.template!.fields.find(f => f.id === fieldId);
      if (!originalField) return prev;
      
      const duplicatedField: FormField = {
        ...originalField,
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${originalField.name} (Copy)`,
        order: prev.template!.fields.length,
      };
      
      const updatedTemplate = {
        ...prev.template!,
        fields: [...prev.template!.fields, duplicatedField],
        updatedAt: new Date(),
      };
      
      return {
        ...prev,
        template: updatedTemplate,
        isDirty: true,
      };
    });
  }, []);

  const validateForm = useCallback(() => {
    if (!state.template) return null;
    
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // Validate template structure
    if (state.template.fields.length === 0) {
      warnings.push('Form has no fields');
    }
    
    // Validate each field
    state.template.fields.forEach(field => {
      if (!field.name || field.name.trim() === '') {
        errors.push(`Field ${field.id} has no name`);
      }
      
      if (!field.label || field.label.trim() === '') {
        warnings.push(`Field ${field.name} has no label`);
      }
      
      if (field.required && !field.validation?.some(v => v.type === 'required')) {
        warnings.push(`Required field ${field.name} has no required validation`);
      }
      
      if (field.type === 'select' || field.type === 'multiselect') {
        if (!field.options || field.options.length === 0) {
          errors.push(`Select field ${field.name} has no options`);
        }
      }
    });
    
    const validationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: errors.length === 0 ? 'Form is valid' : `Form has ${errors.length} error(s)`,
    };
    
    setState(prev => ({
      ...prev,
      validationResult,
      validationMode: true,
    }));
    
    onValidationChange?.(validationResult);
    
    return validationResult;
  }, [state.template, onValidationChange]);

  const saveTemplate = useCallback(async () => {
    if (!state.template) return false;
    
    try {
      const validation = validateForm();
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.summary);
        return false;
      }
      
      const success = await formBuilderService.saveTemplate(state.template);
      
      if (success) {
        setState(prev => ({
          ...prev,
          isDirty: false,
          errors: [],
        }));
        
        onSave?.(state.template);
        Alert.alert('Success', 'Form template saved successfully');
      } else {
        Alert.alert('Error', 'Failed to save form template');
      }
      
      return success;
    } catch (error) {
      console.error('Error saving template:', error);
      Alert.alert('Error', 'Failed to save form template');
      return false;
    }
  }, [state.template, validateForm, onSave]);

  const exportTemplate = useCallback(async (options: any) => {
    if (!state.template) return '';
    
    try {
      const exportedData = await formBuilderService.exportTemplate(state.template, options);
      return exportedData;
    } catch (error) {
      console.error('Error exporting template:', error);
      Alert.alert('Error', 'Failed to export form template');
      return '';
    }
  }, [state.template]);

  const importTemplate = useCallback(async (data: string, options: any) => {
    try {
      const importedTemplate = await formBuilderService.importTemplate(data, options);
      
      setState(prev => ({
        ...prev,
        template: importedTemplate,
        isDirty: true,
      }));
      
      Alert.alert('Success', 'Form template imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing template:', error);
      Alert.alert('Error', 'Failed to import form template');
      return false;
    }
  }, []);

  const resetForm = useCallback(() => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to reset the form? All unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setState(prev => ({
              ...prev,
              template: createEmptyTemplate(),
              selectedField: null,
              isDirty: false,
              errors: [],
              warnings: [],
              validationResult: null,
            }));
          },
        },
      ]
    );
  }, []);

  const undo = useCallback(() => {
    // Implement undo functionality
    console.log('Undo action');
  }, []);

  const redo = useCallback(() => {
    // Implement redo functionality
    console.log('Redo action');
  }, []);

  // Drag and Drop Handlers
  const handleDragStart = useCallback((item: DragItem) => {
    setState(prev => ({
      ...prev,
      draggedField: item.type === 'field' ? item.data as FormField : null,
    }));
  }, []);

  const handleDragEnd = useCallback((result: DragResult) => {
    if (result.source.type === 'field' && result.target.type === 'field') {
      const sourceField = result.source.data as FormField;
      const targetIndex = result.target.index;
      
      if (result.position === 'inside') {
        // Insert at target position
        moveField(sourceField.id, targetIndex);
      } else if (result.position === 'before' || result.position === 'after') {
        // Move to before/after target
        const newIndex = result.position === 'before' ? targetIndex : targetIndex + 1;
        moveField(sourceField.id, newIndex);
      }
    }
    
    setState(prev => ({
      ...prev,
      draggedField: null,
    }));
  }, [moveField]);

  const handleFieldSelect = useCallback((field: FormField | null) => {
    setState(prev => ({
      ...prev,
      selectedField: field,
    }));
    onFieldSelect?.(field);
  }, [onFieldSelect]);

  const togglePreviewMode = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: state.previewMode ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setState(prev => ({
      ...prev,
      previewMode: !prev.previewMode,
    }));
  }, [state.previewMode, slideAnim]);

  // Render Methods
  const renderField = useCallback((field: FormField, index: number) => {
    const isSelected = state.selectedField?.id === field.id;
    const isDragged = state.draggedField?.id === field.id;
    
    return (
      <TouchableOpacity
        key={field.id}
        style={[
          styles.fieldContainer,
          isSelected && styles.selectedField,
          isDragged && styles.draggedField,
        ]}
        onPress={() => handleFieldSelect(field)}
        onLongPress={() => {
          // Show field options
          Alert.alert(
            'Field Options',
            `Options for ${field.name}`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Edit', onPress: () => setShowValidationRules(true) },
              { text: 'Duplicate', onPress: () => duplicateField(field.id) },
              { text: 'Delete', style: 'destructive', onPress: () => removeField(field.id) },
            ]
          );
        }}
      >
        <View style={styles.fieldHeader}>
          <Icon name={getFieldIcon(field.type)} size={20} color="#6C5CE7" />
          <Text style={styles.fieldName}>{field.name}</Text>
          <Text style={styles.fieldType}>{field.type}</Text>
          {field.required && <Icon name="asterisk" size={16} color="#FF6B6B" />}
        </View>
        
        <Text style={styles.fieldLabel}>{field.label}</Text>
        
        {field.description && (
          <Text style={styles.fieldDescription}>{field.description}</Text>
        )}
        
        {field.validation && field.validation.length > 0 && (
          <View style={styles.validationIndicator}>
            <Icon name="check-circle" size={16} color="#6BCF7F" />
            <Text style={styles.validationText}>
              {field.validation.length} validation rule(s)
            </Text>
          </View>
        )}
        
        {field.conditional && field.conditional.enabled && (
          <View style={styles.conditionalIndicator}>
            <Icon name="code" size={16} color="#FFA500" />
            <Text style={styles.conditionalText}>Conditional logic</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [state.selectedField, state.draggedField, handleFieldSelect, duplicateField, removeField]);

  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <View style={styles.toolbarLeft}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setShowFieldLibrary(true)}
        >
          <Icon name="add-circle" size={24} color="#6C5CE7" />
          <Text style={styles.toolbarButtonText}>Add Field</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={validateForm}
        >
          <Icon name="check-circle" size={24} color="#6BCF7F" />
          <Text style={styles.toolbarButtonText}>Validate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setShowPreview(true)}
        >
          <Icon name="visibility" size={24} color="#4ECDC4" />
          <Text style={styles.toolbarButtonText}>Preview</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.toolbarRight}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={undo}
          disabled={!state.isDirty}
        >
          <Icon name="undo" size={24} color={state.isDirty ? "#34495E" : "#BDC3C7"} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={redo}
        >
          <Icon name="redo" size={24} color="#34495E" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toolbarButton, state.isDirty && styles.saveButton]}
          onPress={() => setShowSaveDialog(true)}
        >
          <Icon name="save" size={24} color={state.isDirty ? "#FFFFFF" : "#34495E"} />
          <Text style={[styles.toolbarButtonText, state.isDirty && styles.saveButtonText]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatusBar = () => (
    <View style={styles.statusBar}>
      <View style={styles.statusLeft}>
        <Text style={styles.statusText}>
          {state.template?.fields.length || 0} fields
        </Text>
        {state.isDirty && (
          <Text style={styles.dirtyIndicator}>• Unsaved changes</Text>
        )}
      </View>
      
      <View style={styles.statusRight}>
        {state.validationResult && (
          <View style={[
            styles.validationStatus,
            state.validationResult.isValid ? styles.validStatus : styles.invalidStatus,
          ]}>
            <Icon
              name={state.validationResult.isValid ? "check-circle" : "error"}
              size={16}
              color={state.validationResult.isValid ? "#6BCF7F" : "#FF6B6B"}
            />
            <Text style={styles.validationStatusText}>
              {state.validationResult.isValid ? 'Valid' : `${state.validationResult.errors.length} errors`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="description" size={64} color="#BDC3C7" />
      <Text style={styles.emptyStateTitle}>No fields yet</Text>
      <Text style={styles.emptyStateDescription}>
        Start building your form by adding fields from the field library
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => setShowFieldLibrary(true)}
      >
        <Icon name="add-circle" size={20} color="#FFFFFF" />
        <Text style={styles.emptyStateButtonText}>Add Your First Field</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {renderToolbar()}
      {renderStatusBar()}
      
      <View style={styles.content}>
        {state.template?.fields.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <DragList
              data={state.template?.fields || []}
              renderItem={({ item, index }) => renderField(item, index)}
              keyExtractor={(item) => item.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              dragItemStyle={(item, isDragging) => [
                styles.dragItem,
                isDragging && styles.draggingItem,
              ]}
              dragPlaceholderStyle={styles.dragPlaceholder}
              dragPlaceholderData={() => ({ type: 'field' })}
            />
          </ScrollView>
        )}
      </View>
      
      {/* Field Library Modal */}
      <Modal
        visible={showFieldLibrary}
        animationType="slide"
        presentationStyle="page"
        onRequestClose={() => setShowFieldLibrary(false)}
      >
        <FieldLibrary
          config={config}
          onFieldSelect={(field) => {
            addField(field);
            setShowFieldLibrary(false);
          }}
          onClose={() => setShowFieldLibrary(false)}
        />
      </Modal>
      
      {/* Validation Rules Modal */}
      <Modal
        visible={showValidationRules}
        animationType="slide"
        presentationStyle="page"
        onRequestClose={() => setShowValidationRules(false)}
      >
        <ValidationRules
          field={state.selectedField}
          onUpdate={(fieldId, updates) => updateField(fieldId, updates)}
          onClose={() => setShowValidationRules(false)}
        />
      </Modal>
      
      {/* Conditional Logic Modal */}
      <Modal
        visible={showConditionalLogic}
        animationType="slide"
        presentationStyle="page"
        onRequestClose={() => setShowConditionalLogic(false)}
      >
        <ConditionalLogic
          field={state.selectedField}
          template={state.template}
          onUpdate={(fieldId, updates) => updateField(fieldId, updates)}
          onClose={() => setShowConditionalLogic(false)}
        />
      </Modal>
      
      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="page"
        onRequestClose={() => setShowPreview(false)}
      >
        <FormPreview
          template={state.template}
          onClose={() => setShowPreview(false)}
        />
      </Modal>
      
      {/* Save Dialog */}
      <Modal
        visible={showSaveDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSaveDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.saveDialog}>
            <Text style={styles.saveDialogTitle}>Save Form Template</Text>
            <Text style={styles.saveDialogDescription}>
              Save your form template to use it later or share it with others
            </Text>
            
            <View style={styles.saveDialogActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSaveDialog(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveDialogButton}
                onPress={async () => {
                  const success = await saveTemplate();
                  if (success) {
                    setShowSaveDialog(false);
                  }
                }}
              >
                <Text style={styles.saveDialogButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper Functions
const createEmptyTemplate = (): FormTemplate => ({
  id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Untitled Form',
  description: '',
  version: '1.0.0',
  category: 'custom',
  tags: [],
  fields: [],
  groups: [],
  settings: {
    title: 'Untitled Form',
    submitButtonText: 'Submit',
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
  createdBy: 'current_user',
  isPublic: false,
  isPublished: false,
});

const getFieldIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    text: 'text-fields',
    number: 'tag',
    email: 'email',
    password: 'lock',
    tel: 'phone',
    url: 'link',
    textarea: 'description',
    select: 'arrow-drop-down',
    multiselect: 'checklist',
    radio: 'radio-button-checked',
    checkbox: 'check-box',
    switch: 'toggle-on',
    slider: 'tune',
    range: 'linear-scale',
    date: 'event',
    datetime: 'event-available',
    time: 'schedule',
    file: 'attach-file',
    image: 'image',
    video: 'videocam',
    audio: 'mic',
    rating: 'star',
    color: 'palette',
    hidden: 'visibility-off',
    divider: 'horizontal-rule',
    header: 'title',
    paragraph: 'text-fields',
    button: 'touch-app',
    signature: 'gesture',
    calculation: 'calculate',
    lookup: 'search',
    custom: 'extension',
  };
  
  return iconMap[type] || 'help';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495E',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  dirtyIndicator: {
    fontSize: 12,
    color: '#FFA500',
    fontStyle: 'italic',
  },
  validationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  validStatus: {
    backgroundColor: '#E8F8F5',
  },
  invalidStatus: {
    backgroundColor: '#FDEDEC',
  },
  validationStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  fieldContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedField: {
    borderColor: '#6C5CE7',
    borderWidth: 2,
  },
  draggedField: {
    opacity: 0.6,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  fieldType: {
    fontSize: 12,
    color: '#7F8C8D',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 4,
  },
  fieldDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  validationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  validationText: {
    fontSize: 11,
    color: '#6BCF7F',
  },
  conditionalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conditionalText: {
    fontSize: 11,
    color: '#FFA500',
  },
  dragItem: {
    backgroundColor: '#FFFFFF',
  },
  draggingItem: {
    opacity: 0.6,
  },
  dragPlaceholder: {
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#6C5CE7',
    borderStyle: 'dashed',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveDialog: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    margin: 32,
    width: width - 64,
  },
  saveDialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  saveDialogDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
    textAlign: 'center',
  },
  saveDialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  saveDialogButton: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveDialogButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

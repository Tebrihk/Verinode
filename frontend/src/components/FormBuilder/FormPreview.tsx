import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  FormTemplate,
  FormField,
  FormData,
  FormValidationResult,
  FieldValidationError,
  FieldValidationWarning,
  FormBuilderConfig,
} from '../../types/formBuilder';

interface FormPreviewProps {
  template: FormTemplate | null;
  onClose: () => void;
  onSubmit?: (data: FormData) => void;
  config?: FormBuilderConfig;
}

const { width, height } = Dimensions.get('window');

export const FormPreview: React.FC<FormPreviewProps> = ({
  template,
  onClose,
  onSubmit,
  config,
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [validationResult, setValidationResult] = useState<FormValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldWarnings, setFieldWarnings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (template) {
      // Initialize form data with default values
      const initialData: FormData = {};
      template.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        }
      });
      setFormData(initialData);
    }
  }, [template]);

  const validateField = (field: FormField, value: any): { valid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!field.validation || !field.enabled) {
      return { valid: true, errors, warnings };
    }

    field.validation.forEach(rule => {
      if (!rule.enabled) return;

      switch (rule.type) {
        case 'required':
          if (!value || value === '') {
            errors.push(rule.message);
          }
          break;

        case 'minLength':
          if (value && value.length < (rule.parameters?.min || 1)) {
            errors.push(rule.message.replace('{min}', String(rule.parameters?.min || 1)));
          }
          break;

        case 'maxLength':
          if (value && value.length > (rule.parameters?.max || 255)) {
            errors.push(rule.message.replace('{max}', String(rule.parameters?.max || 255)));
          }
          break;

        case 'min':
          if (value && Number(value) < (rule.parameters?.min || 0)) {
            errors.push(rule.message.replace('{min}', String(rule.parameters?.min || 0)));
          }
          break;

        case 'max':
          if (value && Number(value) > (rule.parameters?.max || 100)) {
            errors.push(rule.message.replace('{max}', String(rule.parameters?.max || 100)));
          }
          break;

        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(rule.message);
          }
          break;

        case 'pattern':
          if (value && rule.parameters?.pattern) {
            const regex = new RegExp(rule.parameters.pattern, rule.parameters.flags || '');
            if (!regex.test(value)) {
              errors.push(rule.message);
            }
          }
          break;

        case 'number':
          if (value && isNaN(Number(value))) {
            errors.push(rule.message);
          }
          break;

        case 'integer':
          if (value && !Number.isInteger(Number(value))) {
            errors.push(rule.message);
          }
          break;

        case 'positive':
          if (value && Number(value) <= 0) {
            errors.push(rule.message);
          }
          break;

        case 'negative':
          if (value && Number(value) >= 0) {
            errors.push(rule.message);
          }
          break;
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  };

  const validateForm = (): FormValidationResult => {
    if (!template) {
      return {
        isValid: false,
        errors: [],
        warnings: [],
        summary: 'No template to validate',
      };
    }

    const errors: FieldValidationError[] = [];
    const warnings: FieldValidationWarning[] = [];
    const newFieldErrors: Record<string, string> = {};
    const newFieldWarnings: Record<string, string> = {};

    template.fields.forEach(field => {
      if (!field.enabled) return;

      const value = formData[field.name];
      const validation = validateField(field, value);

      validation.errors.forEach(error => {
        errors.push({
          fieldId: field.id,
          fieldName: field.name,
          message: error,
          type: field.validation?.find(v => v.message === error)?.type || 'unknown',
          value,
        });
        newFieldErrors[field.name] = error;
      });

      validation.warnings.forEach(warning => {
        warnings.push({
          fieldId: field.id,
          fieldName: field.name,
          message: warning,
          type: 'warning',
          value,
        });
        newFieldWarnings[field.name] = warning;
      });
    });

    const result: FormValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: errors.length === 0 
        ? 'Form is valid' 
        : `Form has ${errors.length} error(s)${warnings.length > 0 ? ` and ${warnings.length} warning(s)` : ''}`,
    };

    setValidationResult(result);
    setFieldErrors(newFieldErrors);
    setFieldWarnings(newFieldWarnings);

    return result;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.summary);
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSubmitResult({ success: true, message: 'Form submitted successfully' });
        setShowSubmitModal(true);
      }
    } catch (error) {
      setSubmitResult({ success: false, message: 'Submission failed', error });
      setShowSubmitModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];
    const error = fieldErrors[field.name];
    const warning = fieldWarnings[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredIndicator}> *</Text>}
            </Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <TextInput
              style={[
                styles.textInput,
                error && styles.textInputError,
                warning && styles.textInputWarning,
              ]}
              value={value || ''}
              onChangeText={(text) => handleFieldChange(field.name, text)}
              placeholder={field.placeholder}
              secureTextEntry={field.type === 'password'}
              keyboardType={field.type === 'email' ? 'email-address' : field.type === 'tel' ? 'phone-pad' : 'default'}
              autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
              editable={!field.disabled}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            {warning && <Text style={styles.warningText}>{warning}</Text>}
          </View>
        );

      case 'number':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredIndicator}> *</Text>}
            </Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <TextInput
              style={[
                styles.textInput,
                error && styles.textInputError,
                warning && styles.textInputWarning,
              ]}
              value={value?.toString() || ''}
              onChangeText={(text) => handleFieldChange(field.name, text)}
              placeholder={field.placeholder}
              keyboardType="numeric"
              editable={!field.disabled}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            {warning && <Text style={styles.warningText}>{warning}</Text>}
          </View>
        );

      case 'textarea':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredIndicator}> *</Text>}
            </Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <TextInput
              style={[
                styles.textArea,
                error && styles.textInputError,
                warning && styles.textInputWarning,
              ]}
              value={value || ''}
              onChangeText={(text) => handleFieldChange(field.name, text)}
              placeholder={field.placeholder}
              multiline
              numberOfLines={field.rows || 4}
              editable={!field.disabled}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            {warning && <Text style={styles.warningText}>{warning}</Text>}
          </View>
        );

      case 'select':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredIndicator}> *</Text>}
            </Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <TouchableOpacity
              style={[
                styles.selectButton,
                error && styles.selectButtonError,
                warning && styles.selectButtonWarning,
              ]}
              disabled={field.disabled}
            >
              <Text style={styles.selectButtonText}>
                {value || field.placeholder || 'Select an option'}
              </Text>
              <Icon name="arrow-drop-down" size={20} color="#7F8C8D" />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {warning && <Text style={styles.warningText}>{warning}</Text>}
          </View>
        );

      case 'radio':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredIndicator}> *</Text>}
            </Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <View style={styles.radioGroup}>
              {field.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.radioOption}
                  onPress={() => handleFieldChange(field.name, option.value)}
                  disabled={field.disabled}
                >
                  <View style={[
                    styles.radioCircle,
                    value === option.value && styles.radioCircleSelected,
                  ]}>
                    {value === option.value && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {warning && <Text style={styles.warningText}>{warning}</Text>}
          </View>
        );

      case 'checkbox':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleFieldChange(field.name, !value)}
              disabled={field.disabled}
            >
              <View style={[
                styles.checkbox,
                value && styles.checkboxChecked,
              ]}>
                {value && <Icon name="check" size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                {field.label}
                {field.required && <Text style={styles.requiredIndicator}> *</Text>}
              </Text>
            </TouchableOpacity>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {warning && <Text style={styles.warningText}>{warning}</Text>}
          </View>
        );

      case 'switch':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {field.label}
                {field.required && <Text style={styles.requiredIndicator}> *</Text>}
              </Text>
              <Switch
                value={value || false}
                onValueChange={(switchValue) => handleFieldChange(field.name, switchValue)}
                disabled={field.disabled}
              />
            </View>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {warning && <Text style={styles.warningText}>{warning}</Text>}
          </View>
        );

      case 'date':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredIndicator}> *</Text>}
            </Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <TouchableOpacity
              style={[
                styles.dateButton,
                error && styles.dateButtonError,
                warning && styles.dateButtonWarning,
              ]}
              disabled={field.disabled}
            >
              <Icon name="event" size={20} color="#7F8C8D" />
              <Text style={styles.dateButtonText}>
                {value ? new Date(value).toLocaleDateString() : field.placeholder || 'Select date'}
              </Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {warning && <Text style={styles.warningText}>{warning}</Text>}
          </View>
        );

      case 'file':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredIndicator}> *</Text>}
            </Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <TouchableOpacity
              style={[
                styles.fileButton,
                error && styles.fileButtonError,
                warning && styles.fileButtonWarning,
              ]}
              disabled={field.disabled}
            >
              <Icon name="attach-file" size={20} color="#7F8C8D" />
              <Text style={styles.fileButtonText}>
                {value ? value.name : field.placeholder || 'Choose file'}
              </Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {warning && <Text style={styles.warningText}>{warning}</Text>}
          </View>
        );

      case 'divider':
        return (
          <View key={field.id} style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            {field.text && <Text style={styles.dividerText}>{field.text}</Text>}
            <View style={styles.dividerLine} />
          </View>
        );

      case 'header':
        return (
          <View key={field.id} style={styles.headerContainer}>
            <Text style={styles.headerText}>{field.text}</Text>
          </View>
        );

      case 'paragraph':
        return (
          <View key={field.id} style={styles.paragraphContainer}>
            <Text style={styles.paragraphText}>{field.text}</Text>
          </View>
        );

      default:
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredIndicator}> *</Text>}
            </Text>
            <Text style={styles.unsupportedText}>
              Field type '{field.type}' is not supported in preview
            </Text>
          </View>
        );
    }
  };

  const renderProgressBar = () => {
    if (!template?.settings.showProgressBar) return null;

    const progress = (activeStep + 1) / template.fields.length;
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {activeStep + 1} of {template.fields.length}
        </Text>
      </View>
    );
  };

  const renderValidationSummary = () => {
    if (!template?.settings.showValidationSummary || !validationResult) return null;

    return (
      <View style={styles.validationSummary}>
        <Text style={styles.validationSummaryTitle}>Validation Summary</Text>
        {validationResult.errors.length > 0 && (
          <View style={styles.validationErrors}>
            <Text style={styles.validationErrorsTitle}>Errors ({validationResult.errors.length})</Text>
            {validationResult.errors.map((error, index) => (
              <Text key={index} style={styles.validationErrorText}>
                • {error.fieldName}: {error.message}
              </Text>
            ))}
          </View>
        )}
        {validationResult.warnings.length > 0 && (
          <View style={styles.validationWarnings}>
            <Text style={styles.validationWarningsTitle}>Warnings ({validationResult.warnings.length})</Text>
            {validationResult.warnings.map((warning, index) => (
              <Text key={index} style={styles.validationWarningText}>
                • {warning.fieldName}: {warning.message}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (!template) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTemplateText}>No template to preview</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#34495E" />
          </TouchableOpacity>
          <Text style={styles.title}>Form Preview</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.validateButton} onPress={validateForm}>
            <Icon name="check-circle" size={20} color="#6BCF7F" />
            <Text style={styles.validateButtonText}>Validate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form Title */}
      {template.settings.title && (
        <View style={styles.formTitleContainer}>
          <Text style={styles.formTitle}>{template.settings.title}</Text>
          {template.settings.description && (
            <Text style={styles.formDescription}>{template.settings.description}</Text>
          )}
        </View>
      )}

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Form Content */}
      <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
        {template.fields.map(renderField)}
        
        {/* Validation Summary */}
        {renderValidationSummary()}
      </ScrollView>

      {/* Form Actions */}
      <View style={styles.formActions}>
        {template.settings.cancelButtonText && (
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>{template.settings.cancelButtonText}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <Text style={styles.submitButtonText}>{template.settings.submitButtonText}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Submit Result Modal */}
      <Modal
        visible={showSubmitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultModal}>
            <View style={styles.resultHeader}>
              <Icon
                name={submitResult?.success ? "check-circle" : "error"}
                size={48}
                color={submitResult?.success ? "#6BCF7F" : "#FF6B6B"}
              />
              <Text style={styles.resultTitle}>
                {submitResult?.success ? 'Success!' : 'Error'}
              </Text>
            </View>
            <Text style={styles.resultMessage}>
              {submitResult?.message}
            </Text>
            <TouchableOpacity
              style={styles.resultButton}
              onPress={() => {
                setShowSubmitModal(false);
                if (submitResult?.success) {
                  onClose();
                }
              }}
            >
              <Text style={styles.resultButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  validateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6BCF7F',
  },
  formTitleContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  progressBarContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  formContent: {
    flex: 1,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4,
  },
  requiredIndicator: {
    color: '#FF6B6B',
  },
  fieldDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
  },
  textInputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  textInputWarning: {
    borderColor: '#FFA500',
    backgroundColor: '#FFFBF0',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  selectButtonError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  selectButtonWarning: {
    borderColor: '#FFA500',
    backgroundColor: '#FFFBF0',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#34495E',
    flex: 1,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#6C5CE7',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6C5CE7',
  },
  radioOptionText: {
    fontSize: 16,
    color: '#34495E',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#34495E',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#34495E',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  dateButtonError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  dateButtonWarning: {
    borderColor: '#FFA500',
    backgroundColor: '#FFFBF0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#34495E',
    flex: 1,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  fileButtonError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  fileButtonWarning: {
    borderColor: '#FFA500',
    backgroundColor: '#FFFBF0',
  },
  fileButtonText: {
    fontSize: 16,
    color: '#34495E',
    flex: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#7F8C8D',
  },
  headerContainer: {
    marginVertical: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  paragraphContainer: {
    marginVertical: 16,
  },
  paragraphText: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
  },
  unsupportedText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#FFA500',
    marginTop: 4,
  },
  validationSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  validationSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  validationErrors: {
    marginBottom: 12,
  },
  validationErrorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  validationErrorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginBottom: 2,
  },
  validationWarnings: {
    marginBottom: 12,
  },
  validationWarningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFA500',
    marginBottom: 8,
  },
  validationWarningText: {
    fontSize: 12,
    color: '#FFA500',
    marginBottom: 2,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
  submitButton: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    margin: 32,
    width: width - 64,
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 12,
  },
  resultMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resultButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noTemplateText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 32,
  },
});

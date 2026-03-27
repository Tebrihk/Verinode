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
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  FormField,
  ValidationRule,
  ValidationType,
  ValidationTypeDefinition,
  FormBuilderConfig,
} from '../../types/formBuilder';

interface ValidationRulesProps {
  field: FormField | null;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onClose: () => void;
}

const validationTypeDefinitions: ValidationTypeDefinition[] = [
  {
    type: 'required',
    name: 'Required',
    description: 'Field must have a value',
    applicableFieldTypes: ['text', 'number', 'email', 'password', 'tel', 'url', 'textarea', 'select', 'radio', 'checkbox', 'date', 'datetime', 'time', 'file', 'image', 'video', 'audio', 'rating', 'color'],
    parameters: [],
    defaultMessage: 'This field is required',
  },
  {
    type: 'minLength',
    name: 'Minimum Length',
    description: 'Minimum number of characters',
    applicableFieldTypes: ['text', 'password', 'tel', 'url', 'textarea'],
    parameters: [
      {
        name: 'min',
        type: 'number',
        label: 'Minimum Length',
        description: 'Minimum number of characters',
        required: true,
        defaultValue: 1,
      },
    ],
    defaultMessage: 'Field must be at least {min} characters',
  },
  {
    type: 'maxLength',
    name: 'Maximum Length',
    description: 'Maximum number of characters',
    applicableFieldTypes: ['text', 'password', 'tel', 'url', 'textarea'],
    parameters: [
      {
        name: 'max',
        type: 'number',
        label: 'Maximum Length',
        description: 'Maximum number of characters',
        required: true,
        defaultValue: 255,
      },
    ],
    defaultMessage: 'Field must be no more than {max} characters',
  },
  {
    type: 'min',
    name: 'Minimum Value',
    description: 'Minimum numeric value',
    applicableFieldTypes: ['number', 'slider', 'range', 'rating'],
    parameters: [
      {
        name: 'min',
        type: 'number',
        label: 'Minimum Value',
        description: 'Minimum allowed value',
        required: true,
        defaultValue: 0,
      },
    ],
    defaultMessage: 'Field must be at least {min}',
  },
  {
    type: 'max',
    name: 'Maximum Value',
    description: 'Maximum numeric value',
    applicableFieldTypes: ['number', 'slider', 'range', 'rating'],
    parameters: [
      {
        name: 'max',
        type: 'number',
        label: 'Maximum Value',
        description: 'Maximum allowed value',
        required: true,
        defaultValue: 100,
      },
    ],
    defaultMessage: 'Field must be no more than {max}',
  },
  {
    type: 'pattern',
    name: 'Pattern',
    description: 'Regular expression pattern',
    applicableFieldTypes: ['text', 'password', 'tel', 'url', 'textarea'],
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        label: 'Regex Pattern',
        description: 'Regular expression pattern',
        required: true,
        defaultValue: '',
      },
      {
        name: 'flags',
        type: 'string',
        label: 'Regex Flags',
        description: 'Regular expression flags (g, i, m, etc.)',
        required: false,
        defaultValue: '',
      },
    ],
    defaultMessage: 'Field must match the required pattern',
  },
  {
    type: 'email',
    name: 'Email Format',
    description: 'Valid email address format',
    applicableFieldTypes: ['text', 'email'],
    parameters: [],
    defaultMessage: 'Please enter a valid email address',
  },
  {
    type: 'url',
    name: 'URL Format',
    description: 'Valid URL format',
    applicableFieldTypes: ['text', 'url'],
    parameters: [],
    defaultMessage: 'Please enter a valid URL',
  },
  {
    type: 'phone',
    name: 'Phone Format',
    description: 'Valid phone number format',
    applicableFieldTypes: ['text', 'tel'],
    parameters: [
      {
        name: 'countryCode',
        type: 'string',
        label: 'Country Code',
        description: 'Country code for phone validation',
        required: false,
        defaultValue: 'US',
      },
    ],
    defaultMessage: 'Please enter a valid phone number',
  },
  {
    type: 'number',
    name: 'Number Only',
    description: 'Must be a number',
    applicableFieldTypes: ['text'],
    parameters: [],
    defaultMessage: 'Field must be a number',
  },
  {
    type: 'integer',
    name: 'Integer Only',
    description: 'Must be an integer',
    applicableFieldTypes: ['text', 'number'],
    parameters: [],
    defaultMessage: 'Field must be an integer',
  },
  {
    type: 'decimal',
    name: 'Decimal Number',
    description: 'Must be a decimal number',
    applicableFieldTypes: ['text', 'number'],
    parameters: [
      {
        name: 'decimalPlaces',
        type: 'number',
        label: 'Decimal Places',
        description: 'Maximum number of decimal places',
        required: false,
        defaultValue: 2,
      },
    ],
    defaultMessage: 'Field must be a decimal number',
  },
  {
    type: 'positive',
    name: 'Positive Number',
    description: 'Must be a positive number',
    applicableFieldTypes: ['text', 'number'],
    parameters: [],
    defaultMessage: 'Field must be a positive number',
  },
  {
    type: 'negative',
    name: 'Negative Number',
    description: 'Must be a negative number',
    applicableFieldTypes: ['text', 'number'],
    parameters: [],
    defaultMessage: 'Field must be a negative number',
  },
  {
    type: 'date',
    name: 'Valid Date',
    description: 'Valid date format',
    applicableFieldTypes: ['text', 'date'],
    parameters: [
      {
        name: 'format',
        type: 'string',
        label: 'Date Format',
        description: 'Expected date format',
        required: false,
        defaultValue: 'YYYY-MM-DD',
      },
    ],
    defaultMessage: 'Please enter a valid date',
  },
  {
    type: 'datetime',
    name: 'Valid Date Time',
    description: 'Valid date and time format',
    applicableFieldTypes: ['text', 'datetime'],
    parameters: [
      {
        name: 'format',
        type: 'string',
        label: 'Date Time Format',
        description: 'Expected date time format',
        required: false,
        defaultValue: 'YYYY-MM-DD HH:mm:ss',
      },
    ],
    defaultMessage: 'Please enter a valid date and time',
  },
  {
    type: 'time',
    name: 'Valid Time',
    description: 'Valid time format',
    applicableFieldTypes: ['text', 'time'],
    parameters: [
      {
        name: 'format',
        type: 'string',
        label: 'Time Format',
        description: 'Expected time format',
        required: false,
        defaultValue: 'HH:mm:ss',
      },
    ],
    defaultMessage: 'Please enter a valid time',
  },
  {
    type: 'file',
    name: 'Valid File',
    description: 'Valid file type',
    applicableFieldTypes: ['file'],
    parameters: [
      {
        name: 'allowedTypes',
        type: 'array',
        label: 'Allowed File Types',
        description: 'Allowed file extensions',
        required: false,
        defaultValue: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
      },
      {
        name: 'maxSize',
        type: 'number',
        label: 'Maximum File Size (MB)',
        description: 'Maximum file size in megabytes',
        required: false,
        defaultValue: 10,
      },
    ],
    defaultMessage: 'Please select a valid file',
  },
  {
    type: 'image',
    name: 'Valid Image',
    description: 'Valid image type',
    applicableFieldTypes: ['image'],
    parameters: [
      {
        name: 'allowedTypes',
        type: 'array',
        label: 'Allowed Image Types',
        description: 'Allowed image extensions',
        required: false,
        defaultValue: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      },
      {
        name: 'maxSize',
        type: 'number',
        label: 'Maximum Image Size (MB)',
        description: 'Maximum image size in megabytes',
        required: false,
        defaultValue: 5,
      },
      {
        name: 'minDimensions',
        type: 'object',
        label: 'Minimum Dimensions',
        description: 'Minimum width and height',
        required: false,
        defaultValue: { width: 1, height: 1 },
      },
    ],
    defaultMessage: 'Please select a valid image',
  },
  {
    type: 'video',
    name: 'Valid Video',
    description: 'Valid video type',
    applicableFieldTypes: ['video'],
    parameters: [
      {
        name: 'allowedTypes',
        type: 'array',
        label: 'Allowed Video Types',
        description: 'Allowed video extensions',
        required: false,
        defaultValue: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
      },
      {
        name: 'maxSize',
        type: 'number',
        label: 'Maximum Video Size (MB)',
        description: 'Maximum video size in megabytes',
        required: false,
        defaultValue: 50,
      },
      {
        name: 'maxDuration',
        type: 'number',
        label: 'Maximum Duration (seconds)',
        description: 'Maximum video duration in seconds',
        required: false,
        defaultValue: 300,
      },
    ],
    defaultMessage: 'Please select a valid video',
  },
  {
    type: 'audio',
    name: 'Valid Audio',
    description: 'Valid audio type',
    applicableFieldTypes: ['audio'],
    parameters: [
      {
        name: 'allowedTypes',
        type: 'array',
        label: 'Allowed Audio Types',
        description: 'Allowed audio extensions',
        required: false,
        defaultValue: ['mp3', 'wav', 'ogg', 'aac', 'flac'],
      },
      {
        name: 'maxSize',
        type: 'number',
        label: 'Maximum Audio Size (MB)',
        description: 'Maximum audio size in megabytes',
        required: false,
        defaultValue: 10,
      },
      {
        name: 'maxDuration',
        type: 'number',
        label: 'Maximum Duration (seconds)',
        description: 'Maximum audio duration in seconds',
        required: false,
        defaultValue: 600,
      },
    ],
    defaultMessage: 'Please select a valid audio',
  },
  {
    type: 'custom',
    name: 'Custom Validation',
    description: 'Custom validation function',
    applicableFieldTypes: ['text', 'number', 'email', 'password', 'tel', 'url', 'textarea', 'select', 'radio', 'checkbox', 'date', 'datetime', 'time', 'file', 'image', 'video', 'audio', 'rating', 'color'],
    parameters: [
      {
        name: 'function',
        type: 'string',
        label: 'Validation Function',
        description: 'Custom validation function code',
        required: true,
        defaultValue: '',
      },
      {
        name: 'async',
        type: 'boolean',
        label: 'Async Validation',
        description: 'Whether validation is asynchronous',
        required: false,
        defaultValue: false,
      },
    ],
    defaultMessage: 'Field validation failed',
  },
];

export const ValidationRules: React.FC<ValidationRulesProps> = ({
  field,
  onUpdate,
  onClose,
}) => {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [availableRuleTypes, setAvailableRuleTypes] = useState<ValidationTypeDefinition[]>([]);

  useEffect(() => {
    if (field) {
      setValidationRules(field.validation || []);
      
      // Filter available rule types based on field type
      const availableTypes = validationTypeDefinitions.filter(ruleType =>
        ruleType.applicableFieldTypes.includes(field.type)
      );
      setAvailableRuleTypes(availableTypes);
    }
  }, [field]);

  const addValidationRule = (ruleType: ValidationTypeDefinition) => {
    const newRule: ValidationRule = {
      type: ruleType.type,
      message: ruleType.defaultMessage,
      parameters: {},
      enabled: true,
    };

    // Set default parameters
    ruleType.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        newRule.parameters![param.name] = param.defaultValue;
      }
    });

    setValidationRules(prev => [...prev, newRule]);
    setSelectedRule(newRule);
    setShowRuleEditor(true);
  };

  const updateValidationRule = (ruleId: string, updates: Partial<ValidationRule>) => {
    setValidationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const removeValidationRule = (ruleId: string) => {
    Alert.alert(
      'Remove Validation Rule',
      'Are you sure you want to remove this validation rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setValidationRules(prev => prev.filter(rule => rule.id !== ruleId));
          },
        },
      ]
    );
  };

  const saveValidationRules = () => {
    if (field) {
      onUpdate(field.id, { validation: validationRules });
      onClose();
    }
  };

  const renderValidationRule = (rule: ValidationRule, index: number) => {
    const ruleType = validationTypeDefinitions.find(rt => rt.type === rule.type);
    
    return (
      <View key={index} style={styles.validationRule}>
        <View style={styles.ruleHeader}>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleName}>{ruleType?.name || rule.type}</Text>
            <Text style={styles.ruleDescription}>{ruleType?.description}</Text>
          </View>
          <Switch
            value={rule.enabled}
            onValueChange={(enabled) => updateValidationRule(rule.id!, { enabled })}
          />
        </View>
        
        <Text style={styles.ruleMessage}>{rule.message}</Text>
        
        {rule.parameters && Object.keys(rule.parameters).length > 0 && (
          <View style={styles.ruleParameters}>
            {Object.entries(rule.parameters).map(([key, value]) => (
              <View key={key} style={styles.parameter}>
                <Text style={styles.parameterKey}>{key}:</Text>
                <Text style={styles.parameterValue}>{String(value)}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.ruleActions}>
          <TouchableOpacity
            style={styles.ruleActionButton}
            onPress={() => {
              setSelectedRule(rule);
              setShowRuleEditor(true);
            }}
          >
            <Icon name="edit" size={16} color="#6C5CE7" />
            <Text style={styles.ruleActionText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.ruleActionButton}
            onPress={() => removeValidationRule(rule.id!)}
          >
            <Icon name="delete" size={16} color="#FF6B6B" />
            <Text style={styles.ruleActionText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRuleTypeCard = (ruleType: ValidationTypeDefinition) => (
    <TouchableOpacity
      key={ruleType.type}
      style={styles.ruleTypeCard}
      onPress={() => addValidationRule(ruleType)}
    >
      <View style={styles.ruleTypeIcon}>
        <Icon name="check-circle" size={24} color="#6BCF7F" />
      </View>
      <View style={styles.ruleTypeInfo}>
        <Text style={styles.ruleTypeName}>{ruleType.name}</Text>
        <Text style={styles.ruleTypeDescription}>{ruleType.description}</Text>
        {ruleType.parameters.length > 0 && (
          <Text style={styles.ruleTypeParams}>
            {ruleType.parameters.length} parameter(s)
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!field) {
    return (
      <View style={styles.container}>
        <Text style={styles.noFieldText}>No field selected</Text>
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
          <Text style={styles.title}>Validation Rules</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.saveButton} onPress={saveValidationRules}>
            <Icon name="save" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Field Info */}
      <View style={styles.fieldInfo}>
        <Text style={styles.fieldName}>{field.name}</Text>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        <Text style={styles.fieldType}>{field.type}</Text>
      </View>

      {/* Existing Rules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Validation Rules</Text>
        {validationRules.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="rule" size={48} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>No validation rules added</Text>
            <Text style={styles.emptyStateDescription}>
              Add validation rules to ensure data quality
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.rulesList} showsVerticalScrollIndicator={false}>
            {validationRules.map(renderValidationRule)}
          </ScrollView>
        )}
      </View>

      {/* Available Rule Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Validation Rule</Text>
        <ScrollView style={styles.ruleTypesList} showsVerticalScrollIndicator={false}>
          {availableRuleTypes.map(renderRuleTypeCard)}
        </ScrollView>
      </View>

      {/* Rule Editor Modal */}
      <Modal
        visible={showRuleEditor}
        animationType="slide"
        presentationStyle="page"
        onRequestClose={() => setShowRuleEditor(false)}
      >
        {selectedRule && (
          <View style={styles.ruleEditor}>
            <View style={styles.editorHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowRuleEditor(false)}>
                <Icon name="close" size={24} color="#34495E" />
              </TouchableOpacity>
              <Text style={styles.editorTitle}>
                {selectedRule.id ? 'Edit' : 'Add'} Validation Rule
              </Text>
            </View>

            <ScrollView style={styles.editorContent}>
              {/* Rule Type Info */}
              <View style={styles.editorSection}>
                <Text style={styles.editorSectionTitle}>Rule Type</Text>
                <View style={styles.ruleTypeInfo}>
                  <Text style={styles.ruleTypeName}>
                    {validationTypeDefinitions.find(rt => rt.type === selectedRule.type)?.name}
                  </Text>
                  <Text style={styles.ruleTypeDescription}>
                    {validationTypeDefinitions.find(rt => rt.type === selectedRule.type)?.description}
                  </Text>
                </View>
              </View>

              {/* Enabled Toggle */}
              <View style={styles.editorSection}>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Enabled</Text>
                  <Switch
                    value={selectedRule.enabled}
                    onValueChange={(enabled) => {
                      setSelectedRule({ ...selectedRule, enabled });
                      if (selectedRule.id) {
                        updateValidationRule(selectedRule.id, { enabled });
                      }
                    }}
                  />
                </View>
              </View>

              {/* Error Message */}
              <View style={styles.editorSection}>
                <Text style={styles.editorSectionTitle}>Error Message</Text>
                <TextInput
                  style={styles.messageInput}
                  value={selectedRule.message}
                  onChangeText={(message) => {
                    setSelectedRule({ ...selectedRule, message });
                    if (selectedRule.id) {
                      updateValidationRule(selectedRule.id, { message });
                    }
                  }}
                  placeholder="Enter error message"
                  multiline
                />
              </View>

              {/* Parameters */}
              {selectedRule.parameters && (
                <View style={styles.editorSection}>
                  <Text style={styles.editorSectionTitle}>Parameters</Text>
                  {validationTypeDefinitions
                    .find(rt => rt.type === selectedRule.type)
                    ?.parameters.map((param) => (
                      <View key={param.name} style={styles.parameterEditor}>
                        <Text style={styles.parameterLabel}>{param.label}</Text>
                        <Text style={styles.parameterDescription}>{param.description}</Text>
                        
                        {param.type === 'string' && (
                          <TextInput
                            style={styles.parameterInput}
                            value={selectedRule.parameters![param.name] as string || ''}
                            onChangeText={(value) => {
                              const updatedParameters = {
                                ...selectedRule.parameters!,
                                [param.name]: value,
                              };
                              setSelectedRule({ ...selectedRule, parameters: updatedParameters });
                              if (selectedRule.id) {
                                updateValidationRule(selectedRule.id, { parameters: updatedParameters });
                              }
                            }}
                            placeholder={param.defaultValue as string}
                          />
                        )}
                        
                        {param.type === 'number' && (
                          <TextInput
                            style={styles.parameterInput}
                            value={selectedRule.parameters![param.name]?.toString() || ''}
                            onChangeText={(value) => {
                              const numValue = value ? parseInt(value) : undefined;
                              const updatedParameters = {
                                ...selectedRule.parameters!,
                                [param.name]: numValue,
                              };
                              setSelectedRule({ ...selectedRule, parameters: updatedParameters });
                              if (selectedRule.id) {
                                updateValidationRule(selectedRule.id, { parameters: updatedParameters });
                              }
                            }}
                            keyboardType="numeric"
                            placeholder={param.defaultValue?.toString()}
                          />
                        )}
                        
                        {param.type === 'boolean' && (
                          <View style={styles.booleanToggle}>
                            <Switch
                              value={selectedRule.parameters![param.name] as boolean || false}
                              onValueChange={(value) => {
                                const updatedParameters = {
                                  ...selectedRule.parameters!,
                                  [param.name]: value,
                                };
                                setSelectedRule({ ...selectedRule, parameters: updatedParameters });
                                if (selectedRule.id) {
                                  updateValidationRule(selectedRule.id, { parameters: updatedParameters });
                                }
                              }}
                            />
                            <Text style={styles.booleanValue}>
                              {selectedRule.parameters![param.name] ? 'True' : 'False'}
                            </Text>
                          </View>
                        )}
                        
                        {param.type === 'array' && (
                          <View style={styles.arrayEditor}>
                            <Text style={styles.arrayValue}>
                              {JSON.stringify(selectedRule.parameters![param.name] || [])}
                            </Text>
                            <TouchableOpacity
                              style={styles.arrayEditButton}
                              onPress={() => {
                                // Show array editor modal
                                Alert.alert('Array Editor', 'Array editor not implemented yet');
                              }}
                            >
                              <Icon name="edit" size={16} color="#6C5CE7" />
                              <Text style={styles.arrayEditText}>Edit Array</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        
                        {param.type === 'object' && (
                          <View style={styles.objectEditor}>
                            <Text style={styles.objectValue}>
                              {JSON.stringify(selectedRule.parameters![param.name] || {}, null, 2)}
                            </Text>
                            <TouchableOpacity
                              style={styles.objectEditButton}
                              onPress={() => {
                                // Show object editor modal
                                Alert.alert('Object Editor', 'Object editor not implemented yet');
                              }}
                            >
                              <Icon name="edit" size={16} color="#6C5CE7" />
                              <Text style={styles.objectEditText}>Edit Object</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        
                        {param.required && (
                          <Text style={styles.requiredIndicator}>Required</Text>
                        )}
                      </View>
                    ))}
                </View>
              )}

              {/* Custom Function Editor */}
              {selectedRule.type === 'custom' && (
                <View style={styles.editorSection}>
                  <Text style={styles.editorSectionTitle}>Custom Validation Function</Text>
                  <TextInput
                    style={styles.customFunctionInput}
                    value={selectedRule.customFunction || ''}
                    onChangeText={(customFunction) => {
                      setSelectedRule({ ...selectedRule, customFunction });
                      if (selectedRule.id) {
                        updateValidationRule(selectedRule.id, { customFunction });
                      }
                    }}
                    placeholder="function(value, formData) { return true; }"
                    multiline
                  />
                  <Text style={styles.customFunctionHelp}>
                    Return true for valid, false for invalid, or string for error message
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.editorActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRuleEditor(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              {!selectedRule.id && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    if (!selectedRule.id) {
                      const newRule = {
                        ...selectedRule,
                        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      };
                      setValidationRules(prev => [...prev, newRule]);
                      setShowRuleEditor(false);
                      setSelectedRule(null);
                    }
                  }}
                >
                  <Text style={styles.addButtonText}>Add Rule</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fieldInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  fieldName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  fieldType: {
    fontSize: 12,
    color: '#6C5CE7',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
  rulesList: {
    flex: 1,
  },
  validationRule: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  ruleDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  ruleMessage: {
    fontSize: 14,
    color: '#34495E',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  ruleParameters: {
    marginBottom: 8,
  },
  parameter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  parameterKey: {
    fontSize: 12,
    color: '#7F8C8D',
    marginRight: 8,
  },
  parameterValue: {
    fontSize: 12,
    color: '#34495E',
    fontWeight: '500',
  },
  ruleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  ruleActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ruleActionText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  ruleTypesList: {
    flex: 1,
  },
  ruleTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  ruleTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ruleTypeInfo: {
    flex: 1,
  },
  ruleTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  ruleTypeDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  ruleTypeParams: {
    fontSize: 10,
    color: '#6C5CE7',
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ruleEditor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  editorContent: {
    flex: 1,
    padding: 16,
  },
  editorSection: {
    marginBottom: 24,
  },
  editorSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#34495E',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },
  parameterEditor: {
    marginBottom: 16,
  },
  parameterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4,
  },
  parameterDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  parameterInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
  },
  booleanToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  booleanValue: {
    fontSize: 14,
    color: '#34495E',
  },
  arrayEditor: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  arrayValue: {
    fontSize: 12,
    color: '#34495E',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  arrayEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrayEditText: {
    fontSize: 12,
    color: '#6C5CE7',
  },
  objectEditor: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  objectValue: {
    fontSize: 12,
    color: '#34495E',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  objectEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  objectEditText: {
    fontSize: 12,
    color: '#6C5CE7',
  },
  requiredIndicator: {
    fontSize: 12,
    color: '#FF6B6B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  customFunctionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
    fontFamily: 'monospace',
    minHeight: 120,
  },
  customFunctionHelp: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  editorActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
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
  addButton: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noFieldText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 32,
  },
});

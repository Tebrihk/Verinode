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
  ConditionalRule,
  Condition,
  ConditionalAction,
  ConditionalOperator,
  ConditionalType,
  FormBuilderConfig,
  FormTemplate,
} from '../../types/formBuilder';

interface ConditionalLogicProps {
  field: FormField | null;
  template: FormTemplate | null;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onClose: () => void;
}

const conditionalOperators: {
  operator: ConditionalOperator;
  name: string;
  description: string;
  valueType: 'string' | 'number' | 'boolean' | 'array';
  requiresValue: boolean;
}[] = [
  { operator: 'equals', name: 'Equals', description: 'Field equals value', valueType: 'string', requiresValue: true },
  { operator: 'notEquals', name: 'Not Equals', description: 'Field does not equal value', valueType: 'string', requiresValue: true },
  { operator: 'contains', name: 'Contains', description: 'Field contains value', valueType: 'string', requiresValue: true },
  { operator: 'notContains', name: 'Does Not Contain', description: 'Field does not contain value', valueType: 'string', requiresValue: true },
  { operator: 'startsWith', name: 'Starts With', description: 'Field starts with value', valueType: 'string', requiresValue: true },
  { operator: 'endsWith', name: 'Ends With', description: 'Field ends with value', valueType: 'string', requiresValue: true },
  { operator: 'greaterThan', name: 'Greater Than', description: 'Field greater than value', valueType: 'number', requiresValue: true },
  { operator: 'lessThan', name: 'Less Than', description: 'Field less than value', valueType: 'number', requiresValue: true },
  { operator: 'greaterThanOrEqual', name: 'Greater Than or Equal', description: 'Field greater than or equal to value', valueType: 'number', requiresValue: true },
  { operator: 'lessThanOrEqual', name: 'Less Than or Equal', description: 'Field less than or equal to value', valueType: 'number', requiresValue: true },
  { operator: 'isEmpty', name: 'Is Empty', description: 'Field is empty', valueType: 'string', requiresValue: false },
  { operator: 'isNotEmpty', name: 'Is Not Empty', description: 'Field is not empty', valueType: 'string', requiresValue: false },
  { operator: 'isChecked', name: 'Is Checked', description: 'Checkbox is checked', valueType: 'boolean', requiresValue: false },
  { operator: 'isUnchecked', name: 'Is Unchecked', description: 'Checkbox is unchecked', valueType: 'boolean', requiresValue: false },
  { operator: 'in', name: 'In Array', description: 'Field value is in array', valueType: 'array', requiresValue: true },
  { operator: 'notIn', name: 'Not In Array', description: 'Field value is not in array', valueType: 'array', requiresValue: true },
  { operator: 'between', name: 'Between', description: 'Field is between two values', valueType: 'number', requiresValue: true },
  { operator: 'notBetween', name: 'Not Between', description: 'Field is not between two values', valueType: 'number', requiresValue: true },
  { operator: 'matches', name: 'Matches Pattern', description: 'Field matches regex pattern', valueType: 'string', requiresValue: true },
  { operator: 'notMatches', name: 'Does Not Match Pattern', description: 'Field does not match regex pattern', valueType: 'string', requiresValue: true },
];

const conditionalActions: {
  type: ConditionalAction['type'];
  name: string;
  description: string;
  requiresValue: boolean;
  requiresOptions: boolean;
}[] = [
  { type: 'show', name: 'Show Field', description: 'Show target field', requiresValue: false, requiresOptions: false },
  { type: 'hide', name: 'Hide Field', description: 'Hide target field', requiresValue: false, requiresOptions: false },
  { type: 'enable', name: 'Enable Field', description: 'Enable target field', requiresValue: false, requiresOptions: false },
  { type: 'disable', name: 'Disable Field', description: 'Disable target field', requiresValue: false, requiresOptions: false },
  { type: 'require', name: 'Make Required', description: 'Make target field required', requiresValue: false, requiresOptions: false },
  { type: 'optional', name: 'Make Optional', description: 'Make target field optional', requiresValue: false, requiresOptions: false },
  { type: 'setValue', name: 'Set Value', description: 'Set target field value', requiresValue: true, requiresOptions: false },
  { type: 'addOption', name: 'Add Option', description: 'Add option to select field', requiresValue: false, requiresOptions: true },
  { type: 'removeOption', name: 'Remove Option', description: 'Remove option from select field', requiresValue: false, requiresOptions: true },
];

export const ConditionalLogic: React.FC<ConditionalLogicProps> = ({
  field,
  template,
  onUpdate,
  onClose,
}) => {
  const [conditionalRule, setConditionalRule] = useState<ConditionalRule | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [showConditionEditor, setShowConditionEditor] = useState(false);

  useEffect(() => {
    if (field) {
      setConditionalRule(field.conditional || null);
    }
  }, [field]);

  const createConditionalRule = () => {
    const newRule: ConditionalRule = {
      type: 'show',
      conditions: [],
      action: {
        type: 'show',
        targetFieldId: '',
      },
      enabled: true,
    };
    
    setConditionalRule(newRule);
    setShowRuleEditor(true);
  };

  const updateConditionalRule = (updates: Partial<ConditionalRule>) => {
    if (conditionalRule) {
      setConditionalRule({ ...conditionalRule, ...updates });
    }
  };

  const addCondition = () => {
    if (!conditionalRule) return;
    
    const newCondition: Condition = {
      fieldId: '',
      operator: 'equals',
      value: '',
      logicalOperator: conditionalRule.conditions.length > 0 ? 'AND' : undefined,
    };
    
    updateConditionalRule({
      conditions: [...conditionalRule.conditions, newCondition],
    });
    
    setSelectedCondition(newCondition);
    setShowConditionEditor(true);
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    if (!conditionalRule) return;
    
    const updatedConditions = [...conditionalRule.conditions];
    updatedConditions[index] = { ...updatedConditions[index], ...updates };
    
    updateConditionalRule({ conditions: updatedConditions });
  };

  const removeCondition = (index: number) => {
    if (!conditionalRule) return;
    
    Alert.alert(
      'Remove Condition',
      'Are you sure you want to remove this condition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedConditions = conditionalRule.conditions.filter((_, i) => i !== index);
            updateConditionalRule({ conditions: updatedConditions });
          },
        },
      ]
    );
  };

  const saveConditionalRule = () => {
    if (field && conditionalRule) {
      onUpdate(field.id, { conditional: conditionalRule });
      onClose();
    }
  };

  const removeConditionalRule = () => {
    if (field) {
      onUpdate(field.id, { conditional: undefined });
      setConditionalRule(null);
    }
  };

  const getAvailableFields = (): FormField[] => {
    if (!template) return [];
    return template.fields.filter(f => f.id !== field?.id);
  };

  const getTargetFields = (): FormField[] => {
    if (!template) return [];
    return template.fields.filter(f => f.id !== field?.id);
  };

  const renderCondition = (condition: Condition, index: number) => {
    const sourceField = template?.fields.find(f => f.id === condition.fieldId);
    const operator = conditionalOperators.find(op => op.operator === condition.operator);
    
    return (
      <View key={index} style={styles.condition}>
        <View style={styles.conditionHeader}>
          <Text style={styles.conditionTitle}>
            {index === 0 ? 'IF' : condition.logicalOperator?.toUpperCase()}
          </Text>
          <TouchableOpacity
            style={styles.conditionRemoveButton}
            onPress={() => removeCondition(index)}
          >
            <Icon name="delete" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.conditionContent}>
          <View style={styles.conditionRow}>
            <Text style={styles.conditionLabel}>Field:</Text>
            <Text style={styles.conditionValue}>
              {sourceField?.name || condition.fieldId}
            </Text>
          </View>
          
          <View style={styles.conditionRow}>
            <Text style={styles.conditionLabel}>Operator:</Text>
            <Text style={styles.conditionValue}>
              {operator?.name || condition.operator}
            </Text>
          </View>
          
          {operator?.requiresValue && (
            <View style={styles.conditionRow}>
              <Text style={styles.conditionLabel}>Value:</Text>
              <Text style={styles.conditionValue}>
                {Array.isArray(condition.value) 
                  ? JSON.stringify(condition.value)
                  : String(condition.value)
                }
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.conditionEditButton}
          onPress={() => {
            setSelectedCondition(condition);
            setShowConditionEditor(true);
          }}
        >
          <Icon name="edit" size={16} color="#6C5CE7" />
          <Text style={styles.conditionEditText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAction = (action: ConditionalAction) => {
    const targetField = template?.fields.find(f => f.id === action.targetFieldId);
    const actionType = conditionalActions.find(a => a.type === action.type);
    
    return (
      <View style={styles.action}>
        <View style={styles.actionHeader}>
          <Text style={styles.actionTitle}>THEN</Text>
        </View>
        
        <View style={styles.actionContent}>
          <View style={styles.actionRow}>
            <Text style={styles.actionLabel}>Action:</Text>
            <Text style={styles.actionValue}>
              {actionType?.name || action.type}
            </Text>
          </View>
          
          <View style={styles.actionRow}>
            <Text style={styles.actionLabel}>Target Field:</Text>
            <Text style={styles.actionValue}>
              {targetField?.name || action.targetFieldId}
            </Text>
          </View>
          
          {action.value !== undefined && (
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>Value:</Text>
              <Text style={styles.actionValue}>
                {String(action.value)}
              </Text>
            </View>
          )}
          
          {action.options && action.options.length > 0 && (
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>Options:</Text>
              <Text style={styles.actionValue}>
                {action.options.length} option(s)
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.actionEditButton}
          onPress={() => {
            // Show action editor
            Alert.alert('Action Editor', 'Action editor not implemented yet');
          }}
        >
          <Icon name="edit" size={16} color="#6C5CE7" />
          <Text style={styles.actionEditText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          <Text style={styles.title}>Conditional Logic</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.saveButton} onPress={saveConditionalRule}>
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

      {/* Conditional Rule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Conditional Rule</Text>
          {!conditionalRule ? (
            <TouchableOpacity style={styles.createButton} onPress={createConditionalRule}>
              <Icon name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Rule</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.removeButton} onPress={removeConditionalRule}>
              <Icon name="delete" size={20} color="#FFFFFF" />
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {conditionalRule ? (
          <View style={styles.ruleContent}>
            {/* Rule Type */}
            <View style={styles.ruleType}>
              <Text style={styles.ruleTypeLabel}>Rule Type:</Text>
              <Text style={styles.ruleTypeValue}>
                {conditionalActions.find(a => a.type === conditionalRule.type)?.name}
              </Text>
            </View>
            
            {/* Enabled Toggle */}
            <View style={styles.ruleEnabled}>
              <Text style={styles.ruleEnabledLabel}>Enabled:</Text>
              <Switch
                value={conditionalRule.enabled}
                onValueChange={(enabled) => updateConditionalRule({ enabled })}
              />
            </View>
            
            {/* Conditions */}
            <View style={styles.conditions}>
              <Text style={styles.conditionsTitle}>Conditions</Text>
              {conditionalRule.conditions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="help-outline" size={48} color="#BDC3C7" />
                  <Text style={styles.emptyStateText}>No conditions added</Text>
                  <TouchableOpacity style={styles.addConditionButton} onPress={addCondition}>
                    <Icon name="add" size={16} color="#6C5CE7" />
                    <Text style={styles.addConditionButtonText}>Add Condition</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {conditionalRule.conditions.map(renderCondition)}
                  <TouchableOpacity style={styles.addConditionButton} onPress={addCondition}>
                    <Icon name="add" size={16} color="#6C5CE7" />
                    <Text style={styles.addConditionButtonText}>Add Condition</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {/* Action */}
            <View style={styles.actionSection}>
              <Text style={styles.actionSectionTitle}>Action</Text>
              {renderAction(conditionalRule.action)}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="code" size={48} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>No conditional rule set</Text>
            <Text style={styles.emptyStateDescription}>
              Create a rule to show/hide fields based on conditions
            </Text>
          </View>
        )}
      </View>

      {/* Condition Editor Modal */}
      <Modal
        visible={showConditionEditor}
        animationType="slide"
        presentationStyle="page"
        onRequestClose={() => setShowConditionEditor(false)}
      >
        {selectedCondition && (
          <View style={styles.conditionEditor}>
            <View style={styles.editorHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowConditionEditor(false)}>
                <Icon name="close" size={24} color="#34495E" />
              </TouchableOpacity>
              <Text style={styles.editorTitle}>Edit Condition</Text>
            </View>

            <ScrollView style={styles.editorContent}>
              {/* Field Selection */}
              <View style={styles.editorSection}>
                <Text style={styles.editorSectionTitle}>Field</Text>
                <View style={styles.fieldSelector}>
                  {getAvailableFields().map((availableField) => (
                    <TouchableOpacity
                      key={availableField.id}
                      style={[
                        styles.fieldOption,
                        selectedCondition.fieldId === availableField.id && styles.selectedFieldOption,
                      ]}
                      onPress={() => {
                        const conditionIndex = conditionalRule?.conditions.findIndex(c => c === selectedCondition) || 0;
                        updateCondition(conditionIndex, { fieldId: availableField.id });
                        setSelectedCondition({ ...selectedCondition, fieldId: availableField.id });
                      }}
                    >
                      <Text style={styles.fieldOptionName}>{availableField.name}</Text>
                      <Text style={styles.fieldOptionType}>{availableField.type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Operator Selection */}
              <View style={styles.editorSection}>
                <Text style={styles.editorSectionTitle}>Operator</Text>
                <View style={styles.operatorSelector}>
                  {conditionalOperators.map((op) => (
                    <TouchableOpacity
                      key={op.operator}
                      style={[
                        styles.operatorOption,
                        selectedCondition.operator === op.operator && styles.selectedOperatorOption,
                      ]}
                      onPress={() => {
                        const conditionIndex = conditionalRule?.conditions.findIndex(c => c === selectedCondition) || 0;
                        updateCondition(conditionIndex, { operator: op.operator });
                        setSelectedCondition({ ...selectedCondition, operator: op.operator });
                      }}
                    >
                      <Text style={styles.operatorOptionName}>{op.name}</Text>
                      <Text style={styles.operatorOptionDescription}>{op.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Value Input */}
              {conditionalOperators.find(op => op.operator === selectedCondition.operator)?.requiresValue && (
                <View style={styles.editorSection}>
                  <Text style={styles.editorSectionTitle}>Value</Text>
                  <TextInput
                    style={styles.valueInput}
                    value={selectedCondition.value ? String(selectedCondition.value) : ''}
                    onChangeText={(value) => {
                      const conditionIndex = conditionalRule?.conditions.findIndex(c => c === selectedCondition) || 0;
                      updateCondition(conditionIndex, { value });
                      setSelectedCondition({ ...selectedCondition, value });
                    }}
                    placeholder="Enter value"
                  />
                </View>
              )}

              {/* Logical Operator */}
              {conditionalRule && conditionalRule.conditions.indexOf(selectedCondition) > 0 && (
                <View style={styles.editorSection}>
                  <Text style={styles.editorSectionTitle}>Logical Operator</Text>
                  <View style={styles.logicalOperatorSelector}>
                    <TouchableOpacity
                      style={[
                        styles.logicalOperatorOption,
                        selectedCondition.logicalOperator === 'AND' && styles.selectedLogicalOperatorOption,
                      ]}
                      onPress={() => {
                        const conditionIndex = conditionalRule?.conditions.findIndex(c => c === selectedCondition) || 0;
                        updateCondition(conditionIndex, { logicalOperator: 'AND' });
                        setSelectedCondition({ ...selectedCondition, logicalOperator: 'AND' });
                      }}
                    >
                      <Text style={styles.logicalOperatorOptionText}>AND</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.logicalOperatorOption,
                        selectedCondition.logicalOperator === 'OR' && styles.selectedLogicalOperatorOption,
                      ]}
                      onPress={() => {
                        const conditionIndex = conditionalRule?.conditions.findIndex(c => c === selectedCondition) || 0;
                        updateCondition(conditionIndex, { logicalOperator: 'OR' });
                        setSelectedCondition({ ...selectedCondition, logicalOperator: 'OR' });
                      }}
                    >
                      <Text style={styles.logicalOperatorOptionText}>OR</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.editorActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConditionEditor(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Rule Editor Modal */}
      <Modal
        visible={showRuleEditor}
        animationType="slide"
        presentationStyle="page"
        onRequestClose={() => setShowRuleEditor(false)}
      >
        {conditionalRule && (
          <View style={styles.ruleEditor}>
            <View style={styles.editorHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowRuleEditor(false)}>
                <Icon name="close" size={24} color="#34495E" />
              </TouchableOpacity>
              <Text style={styles.editorTitle}>Edit Conditional Rule</Text>
            </View>

            <ScrollView style={styles.editorContent}>
              {/* Action Type */}
              <View style={styles.editorSection}>
                <Text style={styles.editorSectionTitle}>Action Type</Text>
                <View style={styles.actionTypeSelector}>
                  {conditionalActions.map((action) => (
                    <TouchableOpacity
                      key={action.type}
                      style={[
                        styles.actionTypeOption,
                        conditionalRule.type === action.type && styles.selectedActionTypeOption,
                      ]}
                      onPress={() => updateConditionalRule({ type: action.type, action: { ...conditionalRule.action, type: action.type } })}
                    >
                      <Text style={styles.actionTypeOptionName}>{action.name}</Text>
                      <Text style={styles.actionTypeOptionDescription}>{action.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Target Field */}
              <View style={styles.editorSection}>
                <Text style={styles.editorSectionTitle}>Target Field</Text>
                <View style={styles.targetFieldSelector}>
                  {getTargetFields().map((targetField) => (
                    <TouchableOpacity
                      key={targetField.id}
                      style={[
                        styles.targetFieldOption,
                        conditionalRule.action.targetFieldId === targetField.id && styles.selectedTargetFieldOption,
                      ]}
                      onPress={() => updateConditionalRule({ action: { ...conditionalRule.action, targetFieldId: targetField.id } })}
                    >
                      <Text style={styles.targetFieldOptionName}>{targetField.name}</Text>
                      <Text style={styles.targetFieldOptionType}>{targetField.type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Value */}
              {conditionalActions.find(a => a.type === conditionalRule.type)?.requiresValue && (
                <View style={styles.editorSection}>
                  <Text style={styles.editorSectionTitle}>Action Value</Text>
                  <TextInput
                    style={styles.actionValueInput}
                    value={conditionalRule.action.value ? String(conditionalRule.action.value) : ''}
                    onChangeText={(value) => updateConditionalRule({ action: { ...conditionalRule.action, value } })}
                    placeholder="Enter value"
                  />
                </View>
              )}

              {/* Enabled Toggle */}
              <View style={styles.editorSection}>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Enabled</Text>
                  <Switch
                    value={conditionalRule.enabled}
                    onValueChange={(enabled) => updateConditionalRule({ enabled })}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.editorActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRuleEditor(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  createButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ruleContent: {
    flex: 1,
  },
  ruleType: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  ruleTypeLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  ruleTypeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  ruleEnabled: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ruleEnabledLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  conditions: {
    marginBottom: 16,
  },
  conditionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  condition: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C5CE7',
  },
  conditionRemoveButton: {
    padding: 4,
  },
  conditionContent: {
    marginBottom: 8,
  },
  conditionRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  conditionLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    width: 80,
  },
  conditionValue: {
    fontSize: 12,
    color: '#34495E',
    flex: 1,
  },
  conditionEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conditionEditText: {
    fontSize: 12,
    color: '#6C5CE7',
  },
  actionSection: {
    marginBottom: 16,
  },
  actionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  action: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  actionHeader: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFA500',
  },
  actionContent: {
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    width: 80,
  },
  actionValue: {
    fontSize: 12,
    color: '#34495E',
    flex: 1,
  },
  actionEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionEditText: {
    fontSize: 12,
    color: '#6C5CE7',
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
  addConditionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  addConditionButtonText: {
    fontSize: 12,
    color: '#6C5CE7',
  },
  conditionEditor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  fieldSelector: {
    flex: 1,
  },
  fieldOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedFieldOption: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F8F9FF',
  },
  fieldOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 2,
  },
  fieldOptionType: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  operatorSelector: {
    flex: 1,
  },
  operatorOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedOperatorOption: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F8F9FF',
  },
  operatorOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 2,
  },
  operatorOptionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  valueInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
  },
  logicalOperatorSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  logicalOperatorOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedLogicalOperatorOption: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F8F9FF',
  },
  logicalOperatorOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  actionTypeSelector: {
    flex: 1,
  },
  actionTypeOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedActionTypeOption: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F8F9FF',
  },
  actionTypeOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 2,
  },
  actionTypeOptionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  targetFieldSelector: {
    flex: 1,
  },
  targetFieldOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedTargetFieldOption: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F8F9FF',
  },
  targetFieldOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 2,
  },
  targetFieldOptionType: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  actionValueInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
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
  noFieldText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 32,
  },
});

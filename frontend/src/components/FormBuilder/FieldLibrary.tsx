import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  FieldType,
  FieldTypeDefinition,
  FormBuilderConfig,
  FormField,
  FieldOption,
} from '../../types/formBuilder';

interface FieldLibraryProps {
  config: FormBuilderConfig;
  onFieldSelect: (field: FormField) => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const FieldLibrary: React.FC<FieldLibraryProps> = ({
  config,
  onFieldSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFieldConfig, setShowFieldConfig] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState<FieldType | null>(null);
  const [fieldConfig, setFieldConfig] = useState<Partial<FormField>>({});

  // Define field type definitions
  const fieldTypeDefinitions: FieldTypeDefinition[] = useMemo(() => [
    // Basic Input Fields
    {
      type: 'text',
      name: 'Text Input',
      description: 'Single line text input field',
      icon: 'text-fields',
      category: 'input',
      group: 'basic',
      defaultValue: '',
      properties: [
        {
          name: 'label',
          type: 'string',
          label: 'Label',
          description: 'Field label text',
          required: true,
          defaultValue: '',
        },
        {
          name: 'placeholder',
          type: 'string',
          label: 'Placeholder',
          description: 'Placeholder text',
          required: false,
          defaultValue: '',
        },
        {
          name: 'maxLength',
          type: 'number',
          label: 'Max Length',
          description: 'Maximum character count',
          required: false,
          defaultValue: 255,
        },
        {
          name: 'defaultValue',
          type: 'string',
          label: 'Default Value',
          description: 'Default field value',
          required: false,
          defaultValue: '',
        },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['text'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'minLength', name: 'Min Length', description: 'Minimum character count', applicableFieldTypes: ['text'], parameters: [{ name: 'min', type: 'number', label: 'Min Length', description: 'Minimum length', required: true, defaultValue: 1 }], defaultMessage: 'Field must be at least {min} characters' },
        { type: 'maxLength', name: 'Max Length', description: 'Maximum character count', applicableFieldTypes: ['text'], parameters: [{ name: 'max', type: 'number', label: 'Max Length', description: 'Maximum length', required: true, defaultValue: 255 }], defaultMessage: 'Field must be no more than {max} characters' },
        { type: 'pattern', name: 'Pattern', description: 'Regex pattern validation', applicableFieldTypes: ['text'], parameters: [{ name: 'pattern', type: 'string', label: 'Pattern', description: 'Regex pattern', required: true, defaultValue: '' }], defaultMessage: 'Field must match the required pattern' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['text'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['text'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['text'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'number',
      name: 'Number Input',
      description: 'Numeric input field',
      icon: 'tag',
      category: 'input',
      group: 'basic',
      defaultValue: 0,
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: '' },
        { name: 'min', type: 'number', label: 'Min Value', description: 'Minimum value', required: false, defaultValue: 0 },
        { name: 'max', type: 'number', label: 'Max Value', description: 'Maximum value', required: false, defaultValue: 100 },
        { name: 'step', type: 'number', label: 'Step', description: 'Increment step', required: false, defaultValue: 1 },
        { name: 'defaultValue', type: 'number', label: 'Default Value', description: 'Default field value', required: false, defaultValue: 0 },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['number'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'min', name: 'Min Value', description: 'Minimum value validation', applicableFieldTypes: ['number'], parameters: [{ name: 'min', type: 'number', label: 'Min Value', description: 'Minimum value', required: true, defaultValue: 0 }], defaultMessage: 'Field must be at least {min}' },
        { type: 'max', name: 'Max Value', description: 'Maximum value validation', applicableFieldTypes: ['number'], parameters: [{ name: 'max', type: 'number', label: 'Max Value', description: 'Maximum value', required: true, defaultValue: 100 }], defaultMessage: 'Field must be no more than {max}' },
        { type: 'number', name: 'Number Only', description: 'Must be a number', applicableFieldTypes: ['number'], parameters: [], defaultMessage: 'Field must be a number' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['number'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['number'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['number'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'email',
      name: 'Email Input',
      description: 'Email address input field',
      icon: 'email',
      category: 'input',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Enter email address' },
        { name: 'defaultValue', type: 'string', label: 'Default Value', description: 'Default field value', required: false, defaultValue: '' },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['email'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'email', name: 'Valid Email', description: 'Must be a valid email address', applicableFieldTypes: ['email'], parameters: [], defaultMessage: 'Please enter a valid email address' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['email'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['email'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['email'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'password',
      name: 'Password Input',
      description: 'Password input field with masking',
      icon: 'lock',
      category: 'input',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Enter password' },
        { name: 'defaultValue', type: 'string', label: 'Default Value', description: 'Default field value', required: false, defaultValue: '' },
        { name: 'showPasswordToggle', type: 'boolean', label: 'Show Password Toggle', description: 'Show password visibility toggle', required: false, defaultValue: true },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['password'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'minLength', name: 'Min Length', description: 'Minimum character count', applicableFieldTypes: ['password'], parameters: [{ name: 'min', type: 'number', label: 'Min Length', description: 'Minimum length', required: true, defaultValue: 8 }], defaultMessage: 'Password must be at least {min} characters' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['password'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['password'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['password'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'textarea',
      name: 'Text Area',
      description: 'Multi-line text input field',
      icon: 'description',
      category: 'input',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Enter text here' },
        { name: 'rows', type: 'number', label: 'Rows', description: 'Number of visible rows', required: false, defaultValue: 4 },
        { name: 'maxLength', type: 'number', label: 'Max Length', description: 'Maximum character count', required: false, defaultValue: 500 },
        { name: 'defaultValue', type: 'string', label: 'Default Value', description: 'Default field value', required: false, defaultValue: '' },
        { name: 'autoGrow', type: 'boolean', label: 'Auto Grow', description: 'Automatically grow with content', required: false, defaultValue: false },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['textarea'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'minLength', name: 'Min Length', description: 'Minimum character count', applicableFieldTypes: ['textarea'], parameters: [{ name: 'min', type: 'number', label: 'Min Length', description: 'Minimum length', required: true, defaultValue: 1 }], defaultMessage: 'Field must be at least {min} characters' },
        { type: 'maxLength', name: 'Max Length', description: 'Maximum character count', applicableFieldTypes: ['textarea'], parameters: [{ name: 'max', type: 'number', label: 'Max Length', description: 'Maximum length', required: true, defaultValue: 500 }], defaultMessage: 'Field must be no more than {max} characters' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['textarea'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['textarea'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['textarea'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    // Selection Fields
    {
      type: 'select',
      name: 'Select Dropdown',
      description: 'Single selection dropdown field',
      icon: 'arrow-drop-down',
      category: 'selection',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Select an option' },
        { name: 'options', type: 'array', label: 'Options', description: 'Available options', required: true, defaultValue: [] },
        { name: 'defaultValue', type: 'string', label: 'Default Value', description: 'Default selected value', required: false, defaultValue: '' },
        { name: 'allowClear', type: 'boolean', label: 'Allow Clear', description: 'Allow clearing selection', required: false, defaultValue: true },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['select'], parameters: [], defaultMessage: 'This field is required' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['select'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['select'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['select'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'multiselect',
      name: 'Multi-Select',
      description: 'Multiple selection field',
      icon: 'checklist',
      category: 'selection',
      group: 'basic',
      defaultValue: [],
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Select options' },
        { name: 'options', type: 'array', label: 'Options', description: 'Available options', required: true, defaultValue: [] },
        { name: 'defaultValue', type: 'array', label: 'Default Values', description: 'Default selected values', required: false, defaultValue: [] },
        { name: 'maxSelections', type: 'number', label: 'Max Selections', description: 'Maximum number of selections', required: false, defaultValue: null },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['multiselect'], parameters: [], defaultMessage: 'This field is required' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['multiselect'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['multiselect'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['multiselect'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'radio',
      name: 'Radio Buttons',
      description: 'Radio button selection field',
      icon: 'radio-button-checked',
      category: 'selection',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'options', type: 'array', label: 'Options', description: 'Radio button options', required: true, defaultValue: [] },
        { name: 'defaultValue', type: 'string', label: 'Default Value', description: 'Default selected value', required: false, defaultValue: '' },
        { name: 'orientation', type: 'select', label: 'Orientation', description: 'Button orientation', required: false, defaultValue: 'vertical', options: [{ label: 'Vertical', value: 'vertical' }, { label: 'Horizontal', value: 'horizontal' }] },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['radio'], parameters: [], defaultMessage: 'This field is required' },
      ],
      styling: [
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['radio'], defaultValue: 16 },
        { property: 'spacing', type: 'spacing', label: 'Spacing', description: 'Button spacing', applicableFieldTypes: ['radio'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'checkbox',
      name: 'Checkbox',
      description: 'Checkbox field',
      icon: 'check-box',
      category: 'selection',
      group: 'basic',
      defaultValue: false,
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'defaultValue', type: 'boolean', label: 'Default Checked', description: 'Default checked state', required: false, defaultValue: false },
        { name: 'orientation', type: 'select', label: 'Orientation', description: 'Checkbox orientation', required: false, defaultValue: 'horizontal', options: [{ label: 'Vertical', value: 'vertical' }, { label: 'Horizontal', value: 'horizontal' }] },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['checkbox'], parameters: [], defaultMessage: 'This field is required' },
      ],
      styling: [
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['checkbox'], defaultValue: 16 },
        { property: 'spacing', type: 'spacing', label: 'Spacing', description: 'Checkbox spacing', applicableFieldTypes: ['checkbox'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'switch',
      name: 'Switch',
      description: 'Toggle switch field',
      icon: 'toggle-on',
      category: 'selection',
      group: 'basic',
      defaultValue: false,
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'defaultValue', type: 'boolean', label: 'Default Value', description: 'Default switch state', required: false, defaultValue: false },
      ],
      validations: [],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Switch width', applicableFieldTypes: ['switch'], defaultValue: 50 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Switch border radius', applicableFieldTypes: ['switch'], defaultValue: 25 },
      ],
      supportedFeatures: ['conditional', 'styling'],
    },
    // Date & Time Fields
    {
      type: 'date',
      name: 'Date Picker',
      description: 'Date selection field',
      icon: 'event',
      category: 'datetime',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Select date' },
        { name: 'defaultValue', type: 'date', label: 'Default Value', description: 'Default date value', required: false, defaultValue: null },
        { name: 'minDate', type: 'date', label: 'Min Date', description: 'Minimum selectable date', required: false, defaultValue: null },
        { name: 'maxDate', type: 'date', label: 'Max Date', description: 'Maximum selectable date', required: false, defaultValue: null },
        { name: 'dateFormat', type: 'select', label: 'Date Format', description: 'Date display format', required: false, defaultValue: 'MM/DD/YYYY', options: [{ label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' }, { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' }, { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }] },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['date'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'date', name: 'Valid Date', description: 'Must be a valid date', applicableFieldTypes: ['date'], parameters: [], defaultMessage: 'Please enter a valid date' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['date'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['date'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['date'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'datetime',
      name: 'Date Time Picker',
      description: 'Date and time selection field',
      icon: 'event-available',
      category: 'datetime',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Select date and time' },
        { name: 'defaultValue', type: 'datetime', label: 'Default Value', description: 'Default date time value', required: false, defaultValue: null },
        { name: 'minDate', type: 'datetime', label: 'Min Date Time', description: 'Minimum selectable date time', required: false, defaultValue: null },
        { name: 'maxDate', type: 'datetime', label: 'Max Date Time', description: 'Maximum selectable date time', required: false, defaultValue: null },
        { name: 'dateFormat', type: 'select', label: 'Date Format', description: 'Date display format', required: false, defaultValue: 'MM/DD/YYYY HH:mm', options: [{ label: 'MM/DD/YYYY HH:mm', value: 'MM/DD/YYYY HH:mm' }, { label: 'DD/MM/YYYY HH:mm', value: 'DD/MM/YYYY HH:mm' }, { label: 'YYYY-MM-DD HH:mm', value: 'YYYY-MM-DD HH:mm' }] },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['datetime'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'datetime', name: 'Valid Date Time', description: 'Must be a valid date time', applicableFieldTypes: ['datetime'], parameters: [], defaultMessage: 'Please enter a valid date and time' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['datetime'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['datetime'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['datetime'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'time',
      name: 'Time Picker',
      description: 'Time selection field',
      icon: 'schedule',
      category: 'datetime',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Select time' },
        { name: 'defaultValue', type: 'time', label: 'Default Value', description: 'Default time value', required: false, defaultValue: null },
        { name: 'timeFormat', type: 'select', label: 'Time Format', description: 'Time display format', required: false, defaultValue: 'HH:mm', options: [{ label: 'HH:mm', value: 'HH:mm' }, { label: 'hh:mm A', value: 'hh:mm A' }, { label: '24-hour', value: '24-hour' }] },
        { name: 'interval', type: 'number', label: 'Interval', description: 'Time interval in minutes', required: false, defaultValue: 15 },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['time'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'time', name: 'Valid Time', description: 'Must be a valid time', applicableFieldTypes: ['time'], parameters: [], defaultMessage: 'Please enter a valid time' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['time'], defaultValue: '100%' },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['time'], defaultValue: 16 },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['time'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    // Media Fields
    {
      type: 'file',
      name: 'File Upload',
      description: 'File upload field',
      icon: 'attach-file',
      category: 'media',
      group: 'basic',
      defaultValue: null,
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Choose file' },
        { name: 'accept', type: 'string', label: 'Accept', description: 'Accepted file types', required: false, defaultValue: '*/*' },
        { name: 'multiple', type: 'boolean', label: 'Multiple Files', description: 'Allow multiple file selection', required: false, defaultValue: false },
        { name: 'maxFileSize', type: 'number', label: 'Max File Size', description: 'Maximum file size in MB', required: false, defaultValue: 10 },
        { name: 'maxFiles', type: 'number', label: 'Max Files', description: 'Maximum number of files', required: false, defaultValue: 5 },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['file'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'file', name: 'Valid File', description: 'Must be a valid file', applicableFieldTypes: ['file'], parameters: [], defaultMessage: 'Please select a valid file' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['file'], defaultValue: '100%' },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['file'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'image',
      name: 'Image Upload',
      description: 'Image upload field',
      icon: 'image',
      category: 'media',
      group: 'basic',
      defaultValue: null,
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Choose image' },
        { name: 'accept', type: 'string', label: 'Accept', description: 'Accepted image types', required: false, defaultValue: 'image/*' },
        { name: 'multiple', type: 'boolean', label: 'Multiple Images', description: 'Allow multiple image selection', required: false, defaultValue: false },
        { name: 'maxFileSize', type: 'number', label: 'Max File Size', description: 'Maximum file size in MB', required: false, defaultValue: 5 },
        { name: 'maxFiles', type: 'number', label: 'Max Files', description: 'Maximum number of images', required: false, defaultValue: 5 },
        { name: 'preview', type: 'boolean', label: 'Show Preview', description: 'Show image preview', required: false, defaultValue: true },
        { name: 'crop', type: 'boolean', label: 'Enable Cropping', description: 'Enable image cropping', required: false, defaultValue: false },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['image'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'image', name: 'Valid Image', description: 'Must be a valid image', applicableFieldTypes: ['image'], parameters: [], defaultMessage: 'Please select a valid image' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['image'], defaultValue: '100%' },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['image'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    // Advanced Fields
    {
      type: 'rating',
      name: 'Rating',
      description: 'Star rating field',
      icon: 'star',
      category: 'advanced',
      group: 'basic',
      defaultValue: 0,
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'maxRating', type: 'number', label: 'Max Rating', description: 'Maximum rating value', required: false, defaultValue: 5 },
        { name: 'defaultValue', type: 'number', label: 'Default Rating', description: 'Default rating value', required: false, defaultValue: 0 },
        { name: 'precision', type: 'number', label: 'Precision', description: 'Rating precision (decimal places)', required: false, defaultValue: 1 },
        { name: 'showValues', type: 'boolean', label: 'Show Values', description: 'Show rating values', required: false, defaultValue: true },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['rating'], parameters: [], defaultMessage: 'This field is required' },
        { type: 'min', name: 'Min Rating', description: 'Minimum rating value', applicableFieldTypes: ['rating'], parameters: [{ name: 'min', type: 'number', label: 'Min Rating', description: 'Minimum rating', required: true, defaultValue: 0 }], defaultMessage: 'Rating must be at least {min}' },
        { type: 'max', name: 'Max Rating', description: 'Maximum rating value', applicableFieldTypes: ['rating'], parameters: [{ name: 'max', type: 'number', label: 'Max Rating', description: 'Maximum rating', required: true, defaultValue: 5 }], defaultMessage: 'Rating must be no more than {max}' },
      ],
      styling: [
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['rating'], defaultValue: 16 },
        { property: 'spacing', type: 'spacing', label: 'Spacing', description: 'Star spacing', applicableFieldTypes: ['rating'], defaultValue: 4 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    {
      type: 'color',
      name: 'Color Picker',
      description: 'Color selection field',
      icon: 'palette',
      category: 'advanced',
      group: 'basic',
      defaultValue: '#000000',
      properties: [
        { name: 'label', type: 'string', label: 'Label', description: 'Field label text', required: true, defaultValue: '' },
        { name: 'placeholder', type: 'string', label: 'Placeholder', description: 'Placeholder text', required: false, defaultValue: 'Select color' },
        { name: 'defaultValue', type: 'color', label: 'Default Color', description: 'Default color value', required: false, defaultValue: '#000000' },
        { name: 'showAlpha', type: 'boolean', label: 'Show Alpha', description: 'Show alpha channel', required: false, defaultValue: false },
        { name: 'presetColors', type: 'array', label: 'Preset Colors', description: 'Preset color options', required: false, defaultValue: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'] },
      ],
      validations: [
        { type: 'required', name: 'Required', description: 'Field is required', applicableFieldTypes: ['color'], parameters: [], defaultMessage: 'This field is required' },
      ],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Field width', applicableFieldTypes: ['color'], defaultValue: '100%' },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Field border radius', applicableFieldTypes: ['color'], defaultValue: 8 },
      ],
      supportedFeatures: ['validation', 'conditional', 'styling'],
    },
    // Layout Fields
    {
      type: 'divider',
      name: 'Divider',
      description: 'Visual separator',
      icon: 'horizontal-rule',
      category: 'layout',
      group: 'basic',
      defaultValue: null,
      properties: [
        { name: 'text', type: 'string', label: 'Text', description: 'Divider text', required: false, defaultValue: '' },
        { name: 'thickness', type: 'number', label: 'Thickness', description: 'Line thickness', required: false, defaultValue: 1 },
        { name: 'color', type: 'color', label: 'Color', description: 'Divider color', required: false, defaultValue: '#E0E0E0' },
      ],
      validations: [],
      styling: [
        { property: 'margin', type: 'spacing', label: 'Margin', description: 'Divider margin', applicableFieldTypes: ['divider'], defaultValue: 16 },
      ],
      supportedFeatures: ['conditional', 'styling'],
    },
    {
      type: 'header',
      name: 'Header',
      description: 'Section header',
      icon: 'title',
      category: 'layout',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'text', type: 'string', label: 'Text', description: 'Header text', required: true, defaultValue: '' },
        { name: 'level', type: 'select', label: 'Level', description: 'Header level', required: false, defaultValue: 'h2', options: [{ label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }, { label: 'H4', value: 'h4' }, { label: 'H5', value: 'h5' }, { label: 'H6', value: 'h6' }] },
        { name: 'align', type: 'select', label: 'Alignment', description: 'Text alignment', required: false, defaultValue: 'left', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        { name: 'color', type: 'color', label: 'Color', description: 'Text color', required: false, defaultValue: '#2C3E50' },
      ],
      validations: [],
      styling: [
        { property: 'margin', type: 'spacing', label: 'Margin', description: 'Header margin', applicableFieldTypes: ['header'], defaultValue: 16 },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['header'], defaultValue: 24 },
      ],
      supportedFeatures: ['conditional', 'styling'],
    },
    {
      type: 'paragraph',
      name: 'Paragraph',
      description: 'Text paragraph',
      icon: 'text-fields',
      category: 'layout',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'text', type: 'string', label: 'Text', description: 'Paragraph text', required: true, defaultValue: '' },
        { name: 'fontSize', type: 'number', label: 'Font Size', description: 'Text font size', required: false, defaultValue: 16 },
        { name: 'color', type: 'color', label: 'Color', description: 'Text color', required: false, defaultValue: '#34495E' },
        { name: 'align', type: 'select', label: 'Alignment', description: 'Text alignment', required: false, defaultValue: 'left', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      ],
      validations: [],
      styling: [
        { property: 'margin', type: 'spacing', label: 'Margin', description: 'Paragraph margin', applicableFieldTypes: ['paragraph'], defaultValue: 16 },
        { property: 'lineHeight', type: 'spacing', label: 'Line Height', description: 'Line height', applicableFieldTypes: ['paragraph'], defaultValue: 1.5 },
      ],
      supportedFeatures: ['conditional', 'styling'],
    },
    // Action Fields
    {
      type: 'button',
      name: 'Button',
      description: 'Action button',
      icon: 'touch-app',
      category: 'action',
      group: 'basic',
      defaultValue: '',
      properties: [
        { name: 'text', type: 'string', label: 'Button Text', description: 'Button text', required: true, defaultValue: 'Submit' },
        { name: 'variant', type: 'select', label: 'Variant', description: 'Button variant', required: false, defaultValue: 'primary', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }] },
        { name: 'size', type: 'select', label: 'Size', description: 'Button size', required: false, defaultValue: 'medium', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        { name: 'action', type: 'string', label: 'Action', description: 'Button action', required: false, defaultValue: 'submit' },
      ],
      validations: [],
      styling: [
        { property: 'width', type: 'size', label: 'Width', description: 'Button width', applicableFieldTypes: ['button'], defaultValue: 'auto' },
        { property: 'borderRadius', type: 'border', label: 'Border Radius', description: 'Button border radius', applicableFieldTypes: ['button'], defaultValue: 8 },
        { property: 'fontSize', type: 'typography', label: 'Font Size', description: 'Text font size', applicableFieldTypes: ['button'], defaultValue: 16 },
      ],
      supportedFeatures: ['conditional', 'styling'],
    },
    // Custom Fields
    {
      type: 'custom',
      name: 'Custom Field',
      description: 'Custom component field',
      icon: 'extension',
      category: 'custom',
      group: 'advanced',
      defaultValue: null,
      properties: [
        { name: 'component', type: 'string', label: 'Component', description: 'Custom component name', required: true, defaultValue: '' },
        { name: 'props', type: 'object', label: 'Props', description: 'Component props', required: false, defaultValue: {} },
      ],
      validations: [],
      styling: [],
      supportedFeatures: ['conditional', 'styling'],
    },
  ];

  // Field categories
  const categories = [
    { id: 'all', name: 'All Fields', icon: 'apps', color: '#6C5CE7' },
    { id: 'input', name: 'Input Fields', icon: 'input', color: '#4ECDC4' },
    { id: 'selection', name: 'Selection Fields', icon: 'checklist', color: '#FFA500' },
    { id: 'datetime', name: 'Date & Time', icon: 'event', color: '#FF6B6B' },
    { id: 'media', name: 'Media Fields', icon: 'attach-file', color: '#9B59B6' },
    { id: 'advanced', name: 'Advanced', icon: 'extension', color: '#8E44AD' },
    { id: 'layout', name: 'Layout', icon: 'view-quilt', color: '#34495E' },
    { id: 'action', name: 'Action', icon: 'touch-app', color: '#E91E63' },
    { id: 'custom', name: 'Custom', icon: 'code', color: '#795548' },
  ];

  // Filter field types based on search and category
  const filteredFieldTypes = useMemo(() => {
    let filtered = fieldTypeDefinitions;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(field =>
        field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(field => field.category === selectedCategory);
    }
    
    return filtered;
  }, [fieldTypeDefinitions, searchQuery, selectedCategory]);

  // Handle field selection
  const handleFieldSelect = useCallback((fieldType: FieldTypeDefinition) => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: fieldType.type,
      name: fieldType.name.toLowerCase().replace(/\s+/g, '_'),
      label: fieldType.name,
      required: false,
      disabled: false,
      defaultValue: fieldType.defaultValue,
      options: [],
      validation: [],
      conditional: undefined,
      styling: {},
      metadata: {},
      order: 0,
    };
    
    // Apply default properties
    fieldType.properties.forEach(property => {
      if (property.defaultValue !== undefined) {
        newField[property.name as keyof FormField] = property.defaultValue;
      }
    });
    
    // Set default validation rules
    if (fieldType.validations.length > 0) {
      const requiredRule = fieldType.validations.find(v => v.type === 'required');
      if (requiredRule) {
        newField.validation = [requiredRule];
      }
    }
    
    if (fieldConfig) {
      Object.assign(newField, fieldConfig);
    }
    
    onFieldSelect(newField);
    onClose();
  }, [onFieldSelect, onClose]);

  // Handle field configuration
  const handleFieldConfig = useCallback((fieldType: FieldTypeDefinition, config: Partial<FormField>) => {
    setSelectedFieldType(fieldType);
    setFieldConfig(config);
    setShowFieldConfig(true);
  }, []);

  const handleConfigSave = useCallback(() => {
    if (selectedFieldType && fieldConfig) {
      const newField: FormField = {
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: selectedFieldType.type,
        name: selectedFieldType.name.toLowerCase().replace(/\s+/g, '_'),
        label: selectedFieldType.name,
        required: false,
        disabled: false,
        defaultValue: selectedFieldType.defaultValue,
        options: [],
        validation: [],
        conditional: undefined,
        styling: {},
        metadata: {},
        order: 0,
        ...fieldConfig,
      };
      
      // Apply default properties
      selectedFieldType.properties.forEach(property => {
        if (property.defaultValue !== undefined && !(property.name in fieldConfig)) {
          newField[property.name as keyof FormField] = property.defaultValue;
        }
      });
      
      onFieldSelect(newField);
      setShowFieldConfig(false);
      setSelectedFieldType(null);
      setFieldConfig({});
    }
  }, [selectedFieldType, fieldConfig, onFieldSelect]);

  // Render field type card
  const renderFieldTypeCard = (fieldType: FieldTypeDefinition) => (
    <TouchableOpacity
      key={fieldType.type}
      style={styles.fieldTypeCard}
      onPress={() => handleFieldSelect(fieldType)}
    >
      <View style={styles.fieldTypeIcon}>
        <Icon name={fieldType.icon} size={32} color={fieldType.category === 'input' ? '#4ECDC4' : fieldType.category === 'selection' ? '#FFA500' : fieldType.category === 'datetime' ? '#FF6B6B' : fieldType.category === 'media' ? '#9B59B6' : fieldType.category === 'advanced' ? '#8E44AD' : fieldType.category === 'layout' ? '#34495E' : fieldType.category === 'action' ? '#E91E63' : '#795548'} />
      </View>
      <View style={styles.fieldTypeInfo}>
        <Text style={styles.fieldTypeName}>{fieldType.name}</Text>
        <Text style={styles.fieldTypeDescription}>{fieldType.description}</Text>
        <View style={styles.fieldTypeFeatures}>
          {fieldType.supportedFeatures.includes('validation') && (
            <View style={styles.featureTag}>
              <Icon name="check-circle" size={12} color="#6BCF7F" />
              <Text style={styles.featureTagText}>Validation</Text>
            </View>
          )}
          {fieldType.supportedFeatures.includes('conditional') && (
            <View style={styles.featureTag}>
              <Icon name="code" size={12} color="#FFA500" />
              <Text style={styles.featureTagText}>Conditional</Text>
            </View>
          )}
          {fieldType.supportedFeatures.includes('styling') && (
            <View style={styles.featureTag}>
              <Icon name="palette" size={12} color="#6C5CE7" />
              <Text style={styles.featureTagText}>Styling</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render category tab
  const renderCategoryTab = (category: typeof categories[0]) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryTab,
        selectedCategory === category.id && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Icon name={category.icon} size={16} color={selectedCategory === category.id ? '#FFFFFF' : category.color} />
      <Text style={[
        styles.categoryTabText,
        selectedCategory === category.id && styles.selectedCategoryTabText,
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#34495E" />
          </TouchableOpacity>
          <Text style={styles.title}>Field Library</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" size={20} color="#7F8C8D" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search fields..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#7F8C8D"
        />
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
        {categories.map(renderCategoryTab)}
      </ScrollView>

      {/* Field Types */}
      <ScrollView style={styles.fieldTypesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.fieldTypesGrid}>
          {filteredFieldTypes.map(renderFieldTypeCard)}
        </View>
      </ScrollView>

      {/* Field Configuration Modal */}
      <Modal
        visible={showFieldConfig}
        animationType="slide"
        presentationStyle="page"
        onRequestClose={() => setShowFieldConfig(false)}
      >
        {selectedFieldType && (
          <View style={styles.configModal}>
            <View style={styles.configHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowFieldConfig(false)}>
                <Icon name="close" size={24} color="#34495E" />
              </TouchableOpacity>
              <Text style={styles.configTitle}>Configure {selectedFieldType.name}</Text>
            </View>

            <ScrollView style={styles.configContent}>
              {selectedFieldType.properties.map((property) => (
                <View key={property.name} style={styles.configProperty}>
                  <Text style={styles.configPropertyLabel}>{property.label}</Text>
                  <Text style={styles.configPropertyDescription}>{property.description}</Text>
                  
                  {property.type === 'string' && (
                    <TextInput
                      style={styles.configInput}
                      placeholder={property.placeholder}
                      defaultValue={fieldConfig[property.name as keyof FormField] as string || ''}
                      onChangeText={(value) => {
                        setFieldConfig(prev => ({
                          ...prev,
                          [property.name]: value,
                        }));
                      }}
                    />
                  )}
                  
                  {property.type === 'number' && (
                    <TextInput
                      style={styles.configInput}
                      placeholder={property.placeholder}
                      defaultValue={fieldConfig[property.name as keyof FormField] as string || ''}
                      keyboardType="numeric"
                      onChangeText={(value) => {
                        setFieldConfig(prev => ({
                          ...prev,
                          [property.name]: value ? parseInt(value) : undefined,
                        }));
                      }}
                    />
                  )}
                  
                  {property.type === 'boolean' && (
                    <TouchableOpacity
                      style={[
                        styles.configToggle,
                        fieldConfig[property.name as keyof FormField] && styles.configToggleActive,
                      ]}
                      onPress={() => {
                        setFieldConfig(prev => ({
                          ...prev,
                          [property.name]: !prev[property.name as keyof FormField],
                        }));
                      }}
                    >
                      <Text style={[
                        styles.configToggleText,
                        fieldConfig[property.name as keyof FormField] && styles.configToggleTextActive,
                      ]}>
                        {fieldConfig[property.name as keyof FormField] ? 'Enabled' : 'Disabled'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {property.type === 'select' && (
                    <View style={styles.configSelect}>
                      <Text style={styles.configSelectText}>
                        {fieldConfig[property.name as keyof FormField] as string || property.defaultValue}
                      </Text>
                    </View>
                  )}
                  
                  {property.required && (
                    <Text style={styles.configRequired}>Required</Text>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.configActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFieldConfig(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.configSaveButton} onPress={handleConfigSave}>
                <Text style={styles.configSaveButtonText}>Add Field</Text>
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
  closeIcon: {
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
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#34495E',
    paddingVertical: 8,
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedCategoryTab: {
    borderBottomColor: '#6C5CE7',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  selectedCategoryTabText: {
    color: '#6C5CE7',
  },
  fieldTypesContainer: {
    flex: 1,
    padding: 16,
  },
  fieldTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fieldTypeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    width: (width - 48) / 2 - 6, // Half width minus spacing
    minHeight: 120,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldTypeInfo: {
    flex: 1,
  },
  fieldTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  fieldTypeDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  fieldTypeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  featureTagText: {
    fontSize: 10,
    color: '#34495E',
  },
  configModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  configTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  configContent: {
    flex: 1,
    padding: 16,
  },
  configProperty: {
    marginBottom: 20,
  },
  configPropertyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4,
  },
  configPropertyDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  configInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#34495E',
    backgroundColor: '#FFFFFF',
  },
  configToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  configToggleActive: {
    backgroundColor: '#6C5CE7',
  },
  configToggleText: {
    fontSize: 16,
    color: '#34495E',
  },
  configToggleTextActive: {
    color: '#FFFFFF',
  },
  configSelect: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  configSelectText: {
    fontSize: 16,
    color: '#34495E',
  },
  configRequired: {
    fontSize: 12,
    color: '#FF6B6B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  configActions: {
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
  configSaveButton: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  configSaveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

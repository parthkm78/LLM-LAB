import { useState } from 'react';

export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.required;
    }

    // Min length validation
    if (rules.minLength && value && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }

    // Min value validation
    if (rules.min !== undefined && value !== '' && Number(value) < rules.min) {
      return `Must be at least ${rules.min}`;
    }

    // Max value validation
    if (rules.max !== undefined && value !== '' && Number(value) > rules.max) {
      return `Must be no more than ${rules.max}`;
    }

    // Pattern validation
    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Invalid format';
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      return rules.custom(value, values);
    }

    return '';
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      newErrors[name] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return isValid;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const getFieldProps = (name) => ({
    value: values[name] || '',
    onChange: (e) => handleChange(name, e.target.value),
    onBlur: () => handleBlur(name),
    error: touched[name] && errors[name],
    'aria-invalid': touched[name] && errors[name] ? 'true' : 'false'
  });

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    getFieldProps,
    isValid: Object.values(errors).every(error => !error)
  };
};

export default useFormValidation;

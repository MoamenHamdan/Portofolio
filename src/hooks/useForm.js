import { useState } from 'react';

const useForm = (initialState) => {
  const [values, setValues] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const resetForm = () => {
    setValues(initialState);
  };

  return {
    values,
    handleChange,
    resetForm,
    setValues,
  };
};

export default useForm;

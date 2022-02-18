import * as yup from 'yup';

const launchFormValidation = yup.object({
  mission_id: yup
    .number()
    .notOneOf([0], 'Mission is required')
    .required('Mission is required'),
  fullname: yup
    .string()
    .max(100, 'Max. 100 characters')
    .required('Name is required'),
  identification: yup
    .string()
    .required('Identification is required'),
  weight: yup
    .number()
    .notOneOf([0], 'Weight is required')
    .max(99999, 'Max. 5 characters')
    .required('Weight is required'),
  health_problems: yup
    .string()
    .max(500, 'Max. 500 characters'),
  accept_terms: yup
    .bool()
    .oneOf([true], "Accept terms is required")
    .required('Accept terms is required')
});

export default launchFormValidation;
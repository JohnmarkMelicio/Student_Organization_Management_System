export interface Organization {
  id?: number;
  name: string;
  shortName: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  mission: string;
  vision: string;
  social: {
    facebook: string;
    instagram: string;
  };
}

export const EMPTY_ORGANIZATION: Organization = {
  name: '',
  shortName: '',
  description: '',
  email: '',
  phone: '',
  location: '',
  mission: '',
  vision: '',
  social: {
    facebook: '',
    instagram: ''
  }
};
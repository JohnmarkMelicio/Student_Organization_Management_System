export interface Organization {

  id?: string;

  name: string;
  acronym?: string;
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
  acronym: '',
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
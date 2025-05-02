export interface Imprint {
  name: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  contact: {
    phone?: string;
    email: string;
    website?: string;
  };
  responsibleForContent?: string;
  disclaimer?: string;
}

export const imprint: Imprint = {
  name: 'Anton Schmidt',
  address: {
    street: 'Gottlob-Spieß Str. 2',
    postalCode: '74343',
    city: 'Sachsenheim',
    country: 'Germany',
  },
  contact: {
    email: 'cptcr@proton.me',
    website: 'https://www.cptcr.dev',
  },
  responsibleForContent: `Anton Schmidt (Address as above)`,
  disclaimer:
    'All information provided without guarantee. Liability for content and links is excluded to the extent permitted by law.',
};

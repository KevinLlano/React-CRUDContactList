// Local storage key for contacts
const CONTACTS_KEY = 'contacts';

// Helper function to get contacts from local storage
const getContactsFromStorage = () => {
    const contacts = localStorage.getItem(CONTACTS_KEY);
    return contacts ? JSON.parse(contacts) : [];
};

// Helper function to save contacts to local storage
const saveContactsToStorage = (contacts) => {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
};

// Generate a unique ID for new contacts
const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Initialize with sample data if no contacts exist
const initializeSampleData = () => {
    const existingContacts = getContactsFromStorage();
    if (existingContacts.length === 0) {
        const sampleContacts = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                address: '123 Main St, New York, NY 10001',
                title: 'Software Engineer',
                status: 'Active',
                photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            },
            {
                id: '2',
                name: 'Kevin Llanos',
                email: 'kevin.llanos@example.com',
                phone: '+1 (555) 987-6543',
                address: '456 Random St, Texas, TX 75001',
                title: 'Full Stack Developer',
                status: 'Active',
                photoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&h=150&fit=crop&crop=face'
            },
            {
                id: '3',
                name: 'Mike Johnson',
                email: 'mike.johnson@example.com',
                phone: '+1 (555) 456-7890',
                address: '789 Pine Rd, Chicago, IL 60601',
                title: 'Designer',
                status: 'Inactive',
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
        ];
        saveContactsToStorage(sampleContacts);
    }
};

// Convert file to base64 for storage
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// Save contact (create or update)
export async function saveContact(contactData) {
    return new Promise(async (resolve, reject) => {
        try {
            const contacts = getContactsFromStorage();
            let contact;

            // Handle FormData (new contact with photo)
            if (contactData instanceof FormData) {
                contact = {
                    id: generateId(),
                    name: contactData.get('name'),
                    email: contactData.get('email'),
                    phone: contactData.get('phone'),
                    address: contactData.get('address'),
                    title: contactData.get('title'),
                    status: contactData.get('status'),
                    photoUrl: ''
                };

                // Handle photo upload
                const photoFile = contactData.get('photo');
                if (photoFile && photoFile.size > 0) {
                    try {
                        contact.photoUrl = await fileToBase64(photoFile);
                    } catch (error) {
                        console.warn('Failed to process image:', error);
                        contact.photoUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
                    }
                } else {
                    contact.photoUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
                }

                contacts.push(contact);
            } else {
                // Handle JSON data (update existing contact)
                const existingIndex = contacts.findIndex(c => c.id === contactData.id);
                if (existingIndex !== -1) {
                    contacts[existingIndex] = { ...contacts[existingIndex], ...contactData };
                    contact = contacts[existingIndex];
                } else {
                    // New contact from JSON
                    contact = {
                        ...contactData,
                        id: contactData.id || generateId(),
                        photoUrl: contactData.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
                    };
                    contacts.push(contact);
                }
            }

            saveContactsToStorage(contacts);
            
            setTimeout(() => {
                resolve({ data: contact });
            }, 300); // Simulate network delay
        } catch (error) {
            reject(error);
        }
    });
}

// Get all contacts with pagination
export async function getContacts(page = 0, size = 10) {
    return new Promise((resolve) => {
        initializeSampleData();
        const contacts = getContactsFromStorage();
        
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedContacts = contacts.slice(startIndex, endIndex);
        
        const response = {
            data: {
                content: paginatedContacts,
                totalElements: contacts.length,
                totalPages: Math.ceil(contacts.length / size),
                number: page,
                size: size,
                first: page === 0,
                last: page >= Math.ceil(contacts.length / size) - 1
            }
        };
        
        setTimeout(() => {
            resolve(response);
        }, 300); // Simulate network delay
    });
}

// Get a single contact by ID
export async function getContact(id) {
    return new Promise((resolve, reject) => {
        const contacts = getContactsFromStorage();
        const contact = contacts.find(c => c.id === id);
        
        setTimeout(() => {
            if (contact) {
                resolve({ data: contact });
            } else {
                reject(new Error('Contact not found'));
            }
        }, 300); // Simulate network delay
    });
}

// Update contact
export async function updateContact(contact) {
    return saveContact(contact);
}

// Update contact image
export async function updateContactImage(formData) {
    return new Promise(async (resolve, reject) => {
        try {
            const contacts = getContactsFromStorage();
            const contactId = formData.get('id');
            const file = formData.get('file');
            
            const contactIndex = contacts.findIndex(c => c.id === contactId);
            if (contactIndex === -1) {
                reject(new Error('Contact not found'));
                return;
            }
            
            if (file && file.size > 0) {
                try {
                    contacts[contactIndex].photoUrl = await fileToBase64(file);
                } catch (error) {
                    console.warn('Failed to process image:', error);
                }
            }
            
            saveContactsToStorage(contacts);
            
            setTimeout(() => {
                resolve({ data: contacts[contactIndex] });
            }, 300);
        } catch (error) {
            reject(error);
        }
    });
}

// Delete contact by ID
export async function deleteContact(id) {
    return new Promise((resolve, reject) => {
        try {
            const contacts = getContactsFromStorage();
            const filteredContacts = contacts.filter(c => c.id !== id);
            
            if (filteredContacts.length === contacts.length) {
                reject(new Error('Contact not found'));
                return;
            }
            
            saveContactsToStorage(filteredContacts);
            
            setTimeout(() => {
                resolve({ data: { message: 'Contact deleted successfully' } });
            }, 300); // Simulate network delay
        } catch (error) {
            reject(error);
        }
    });
}

// Clear existing data and reinitialize (for development - remove in production)
export const clearAndReinitializeData = () => {
    localStorage.removeItem(CONTACTS_KEY);
    initializeSampleData();
};

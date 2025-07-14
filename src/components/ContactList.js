import React from "react"; // Importing React to create a functional component.
import Contact from "./Contact.js"; // Importing the `Contact` component to display individual contact information.
import { deleteContact } from '../api/ContactService'; // Import the deleteContact function from your service file
import { toastError, toastSuccess } from '../api/ToastService.js';
import { useNavigate } from 'react-router-dom';

const ContactList = ({ data, currentPage, getAllContacts }) => {
    const navigate = useNavigate();

    // Handler function to delete a contact by ID
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await deleteContact(id);
                await getAllContacts(currentPage); // Refresh the contact list after deletion
                toastSuccess('Contact deleted successfully');
            } catch (error) {
                console.error("Failed to delete contact:", error);
                toastError(error.message || 'Failed to delete contact');
            }
        }
    };

    // Handler function to edit a contact
    const handleEdit = (id) => {
        navigate(`/contacts/${id}`);
    };

    return (
        <main className="main">
            {data?.content?.length === 0 && (
                <div className="no-contacts">
                    <i className="bi bi-person-x" style={{fontSize: '3rem', color: 'var(--dark-gray)', marginBottom: '1rem'}}></i>
                    <h3>No Contacts Found</h3>
                    <p>Start by adding your first contact using the "Add New Contact" button above.</p>
                </div>
            )}

            <ul className="contact__list">
                {data?.content?.length > 0 &&
                    data.content.map((contact) => (
                        <li key={contact.id}>
                            <Contact 
                                contact={contact} 
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </li>
                    ))}
            </ul>

            {data?.content?.length > 0 && data?.totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => getAllContacts(currentPage - 1)}
                        className={0 === currentPage ? "disabled" : ""}
                    >
                        &laquo; {/* Left arrow symbol */}
                    </button>
                    {data &&
                        [...Array(data.totalPages).keys()].map((page, index) => (
                            <React.Fragment key={page}>
                                <button
                                    onClick={() => getAllContacts(page)}
                                    className={currentPage === page ? "active" : ""}
                                >
                                    {page + 1} {/* Display the page number */}
                                </button>
                                {index < data.totalPages - 1 && (
                                    <span
                                        style={{
                                            margin: "50px 0px",
                                            borderBottom: "3px solid #000",
                                            width: "20px",
                                            display: "inline-block",
                                        }}
                                    ></span>
                                )}
                            </React.Fragment>
                        ))}
                    <button
                        onClick={() => getAllContacts(currentPage + 1)}
                        className={data.totalPages === currentPage + 1 ? "disabled" : ""}
                    >
                        &raquo; {/* Right arrow symbol */}
                    </button>
                </div>
            )}
        </main>
    );
};

export default ContactList; // Exporting the `ContactList` component so it can be used in other parts of the app.

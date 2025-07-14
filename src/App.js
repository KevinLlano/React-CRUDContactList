import { useEffect, useRef, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header.js';
import ContactList from './components/ContactList.js';
import { getContacts, saveContact, updateContactImage } from './api/ContactService.js';
import { Routes, Route, Navigate } from 'react-router-dom';
import ContactDetail from './components/ContactDetail.js';
import { toastError, toastSuccess } from './api/ToastService.js';
import { ToastContainer } from 'react-toastify';

function App() {
  const modalRef = useRef();
  const fileRef = useRef();

  const [data, setData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [file, setFile] = useState(undefined);
  const [values, setValues] = useState({
    name: '', email: '', phone: '', address: '', title: '', status: '',
  });

  // Fetch all contacts
  const getAllContacts = async (page = 0, size = 10) => {
    try {
      setCurrentPage(page);
      const { data } = await getContacts(page, size);
      setData(data);
    } catch (error) {
      console.log(error);
      toastError(error.message);
    }
  };

  // Handle form input changes
  const onChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  // Handle new contact form submission with file upload
  const handleNewContact = async (event) => {
    event.preventDefault();
    try {
      // Prepare FormData to include all contact details and the image file
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('address', values.address);
      formData.append('title', values.title);
      formData.append('status', values.status);

      // Add file if it exists
      if (file) {
        formData.append('photo', file, file.name);
      }

      // Submit contact data with image
      await saveContact(formData);

      // Reset form fields and fetch contacts
      toggleModal(false);
      setFile(undefined);
      fileRef.current.value = null;
      setValues({ name: '', email: '', phone: '', address: '', title: '', status: '' });
      await getAllContacts();
      toastSuccess('Contact created successfully!');
    } catch (error) {
      console.log(error);
      toastError(error.message);
    }
  };

  // Update contact
  const updateContact = async (contact) => {
    try {
      const { data } = await saveContact(contact);
      console.log(data);
      toastSuccess('Contact updated successfully!');
    } catch (error) {
      console.log(error);
      toastError(error.message);
    }
  };

  // Update image (Corrected the function)
  const updateImage = async (formData) => {
    try {
      await updateContactImage(formData);
      toastSuccess('Photo updated successfully!');
    } catch (error) {
      console.log(error);
      toastError(error.message);
    }
  };

  const toggleModal = (show) => show ? modalRef.current.showModal() : modalRef.current.close();

  // Fetch contacts on component mount
  useEffect(() => {
    getAllContacts();
  }, []);

  return (
    <>
      <Header toggleModal={toggleModal} nbOfContacts={data.totalElements} />

      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to={'/contacts'} />} />
            <Route path="/contacts" element={<ContactList data={data} currentPage={currentPage} getAllContacts={getAllContacts} />} />
            <Route path="/contacts/:id" element={<ContactDetail updateContact={updateContact} updateImage={updateImage} />} />
          </Routes>
        </div>
      </main>

      <dialog ref={modalRef} className="modal" id="modal">
        <div className="modal__header">
          <h3>New Contact</h3>
          <i onClick={() => toggleModal(false)} className="bi bi-x-lg"></i>
        </div>
        <div className="divider"></div>
        <div className="modal__body">
          <form onSubmit={handleNewContact}>
            <div className="user-details">
              <div className="input-box">
                <span className="details">Name</span>
                <input type="text" value={values.name} onChange={onChange} name="name" required />
              </div>
              <div className="input-box">
                <span className="details">Email</span>
                <input type="email" value={values.email} onChange={onChange} name="email" required />
              </div>
              <div className="input-box">
                <span className="details">Phone</span>
                <input type="tel" value={values.phone} onChange={onChange} name="phone" required />
              </div>
              <div className="input-box">
                <span className="details">Address</span>
                <input type="text" value={values.address} onChange={onChange} name="address" required />
              </div>
              <div className="input-box">
                <span className="details">Title</span>
                <input type="text" value={values.title} onChange={onChange} name="title" required />
              </div>
              <div className="input-box">
                <span className="details">Status</span>
                <input type="text" value={values.status} onChange={onChange} name="status" required />
              </div>
              <div className="file-input">
                <span className="details">Profile Photo</span>
                <input type="file" onChange={(event) => setFile(event.target.files[0])} ref={fileRef} name="photo" required />
              </div>
            </div>
            <div className="form_footer">
              <button onClick={() => toggleModal(false)} type="button" className="btn btn-danger">Cancel</button>
              <button type="submit" className="btn">Save</button>
            </div>
          </form>
        </div>
      </dialog>

      <ToastContainer />
    </>
  );
}

export default App;

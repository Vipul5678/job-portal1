import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/recruiter';

const RecruiterSignUp = () => {
const [formData, setFormData] = useState({
name: '',
email: '',
password: '',
company: '',
phone: ''
});

const [logo, setLogo] = useState(null);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
const { name, value } = e.target;

```
setFormData((prev) => ({
  ...prev,
  [name]: value
}));
```

};

const handleLogoChange = (e) => {
setLogo(e.target.files[0]);
};

const handleSubmit = async (e) => {
e.preventDefault();

```
setError('');
setLoading(true);

try {
  const formDataToSend = new FormData();

  formDataToSend.append('name', formData.name);
  formDataToSend.append('email', formData.email);
  formDataToSend.append('password', formData.password);
  formDataToSend.append('company', formData.company);
  formDataToSend.append('phone', formData.phone);

  if (logo) {
    formDataToSend.append('logo', logo);
  }

  const response = await axios.post(
    `${API_URL}/signup`,
    formDataToSend,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  if (response.data.success) {
    alert('Account created successfully!');

    localStorage.setItem('token', response.data.token);

    localStorage.setItem(
      'recruiter',
      JSON.stringify(response.data.recruiter)
    );

    window.location.href = '/recruiter/dashboard';
  }

} catch (err) {
  console.error(err);

  setError(
    err.response?.data?.message ||
    'Signup failed'
  );
} finally {
  setLoading(false);
}
```

};

return (
<div
style={{
minHeight: '100vh',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
background: '#f4f4f4'
}}
>
<form
onSubmit={handleSubmit}
style={{
width: '400px',
background: '#fff',
padding: '30px',
borderRadius: '12px',
boxShadow: '0 0 10px rgba(0,0,0,0.1)',
display: 'flex',
flexDirection: 'column',
gap: '15px'
}}
>
<h2 style={{ textAlign: 'center' }}>
Recruiter Sign Up </h2>

```
    {error && (
      <div
        style={{
          color: 'red',
          textAlign: 'center'
        }}
      >
        {error}
      </div>
    )}

    <input
      type="text"
      name="name"
      placeholder="Full Name"
      value={formData.name}
      onChange={handleChange}
      required
      style={inputStyle}
    />

    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
      required
      style={inputStyle}
    />

    <input
      type="password"
      name="password"
      placeholder="Password"
      value={formData.password}
      onChange={handleChange}
      required
      style={inputStyle}
    />

    <input
      type="text"
      name="company"
      placeholder="Company Name"
      value={formData.company}
      onChange={handleChange}
      required
      style={inputStyle}
    />

    <input
      type="tel"
      name="phone"
      placeholder="Phone Number"
      value={formData.phone}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      type="file"
      accept="image/*"
      onChange={handleLogoChange}
    />

    <button
      type="submit"
      disabled={loading}
      style={{
        padding: '12px',
        background: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      {loading ? 'Creating Account...' : 'Create Account'}
    </button>
  </form>
</div>
```

);
};

const inputStyle = {
padding: '12px',
border: '1px solid #ccc',
borderRadius: '8px',
fontSize: '14px',
width: '100%',
boxSizing: 'border-box',
color: '#000',
background: '#fff'
};

export default RecruiterSignUp;

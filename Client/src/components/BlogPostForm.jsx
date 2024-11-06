import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const BlogPostForm = ({ onPostCreated, user }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/blogPosts', { title, body }, { withCredentials: true });
      if (response.data.success) {
        onPostCreated(response.data.blogPost);
        setTitle('');
        setBody('');
        setError('');
      } else {
        setError(response.data.message || 'Failed to create post.');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('An error occurred while creating the post.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Title:</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Content:</label>
        <textarea 
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          required 
        />
      </div>
      <button type="submit">Submit Post</button>
    </form>
  );
};

BlogPostForm.propTypes = {
  onPostCreated: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default BlogPostForm;
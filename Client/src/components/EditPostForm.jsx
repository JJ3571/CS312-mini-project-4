import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const EditPostForm = ({ post, onCancel, refreshPosts }) => {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/blogPosts/${post.blog_id}`, 
        { title, body }, 
        { withCredentials: true }
      );
      if (response.data.success) {
        setError('');
        refreshPosts();
        onCancel();
      } else {
        setError(response.data.message || 'Failed to update post.');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError('An error occurred while updating the post.');
    }
  };

  return (
    <form onSubmit={handleUpdate}>
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
      <button type="submit">Update Post</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

EditPostForm.propTypes = {
  post: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  refreshPosts: PropTypes.func.isRequired,
};

export default EditPostForm;
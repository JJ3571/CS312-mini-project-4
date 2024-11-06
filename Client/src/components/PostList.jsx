import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EditPostForm from './EditPostForm.jsx';
import axios from 'axios';

const PostList = ({ posts, currentUser, refreshPosts }) => {
  const [editingPostId, setEditingPostId] = React.useState(null);

  const handleEditClick = (postId) => {
    setEditingPostId(postId);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
  };

  const handleDelete = async (postId) => {
    try {
      const response = await axios.delete(`/api/blogPosts/${postId}`, { withCredentials: true });
      if (response.data.success) {
        refreshPosts();
      } else {
        console.error(response.data.message);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  return (
    <ul>
      {posts.map(post => (
        <li key={post.blog_id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <p><em>By {post.creator_name} on {new Date(post.date_created).toLocaleString()}</em></p>
          {currentUser && currentUser.user_id === post.creator_user_id && (
            <>
              <button onClick={() => handleEditClick(post.blog_id)}>Edit</button>
              <button onClick={() => handleDelete(post.blog_id)}>Delete</button>
            </>
          )}
          {editingPostId === post.blog_id && (
            <EditPostForm post={post} onCancel={handleCancelEdit} refreshPosts={refreshPosts} />
          )}
        </li>
      ))}
    </ul>
  );
};

PostList.propTypes = {
  posts: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  refreshPosts: PropTypes.func.isRequired,
};

export default PostList;
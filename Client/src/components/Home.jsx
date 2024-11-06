import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BlogPostForm from './BlogPostForm.jsx';
import PostList from './PostList.jsx';
import PropTypes from 'prop-types';



const Home = ({ user }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [error, setError] = useState('');

  const fetchBlogPosts = async () => {
    try {
      const response = await axios.get('/api/blogPosts', { withCredentials: true });
      console.log('Fetched Blog Posts:', response.data.blogPosts);
      if (response.data.success === false) {
        setError(response.data.message || 'Failed to fetch blog posts.');
      } else {
        setBlogPosts(response.data.blogPosts);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('An error occurred while fetching blog posts.');
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setBlogPosts([newPost, ...blogPosts]);
  };


  const handleLogout = async () => {
      const response = await axios.post('/api/logout', { withCredentials: true });
      window.location.reload();
  }

  return (
    <div>
      <h1>Welcome {user ? user.name : 'Guest'}!</h1>
      <h2>Blog Posts</h2>
      <button onClick={handleLogout}>Logout</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user ? (
        <BlogPostForm onPostCreated={handlePostCreated} user={user} />
      ) : (
        <p>You must login to submit a post.</p>
      )}
      {blogPosts.length === 0 ? (
        <p>No blog posts available.</p>
      ) : (
        <PostList posts={blogPosts} currentUser={user} refreshPosts={fetchBlogPosts} />
      )}
    </div>
  );
};

Home.propTypes = {
  user: PropTypes.object,
};

export default Home;
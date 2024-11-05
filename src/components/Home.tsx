import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get("/api/blogPosts");
        setBlogPosts(result.data.blogPosts);
        setUser(result.data.user);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Home</h2>
      {user && <p>Welcome, {user.name}</p>}
      <ul>
        {blogPosts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;

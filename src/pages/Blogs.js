import React from 'react'
import style from './Blogs.module.css'
const fakeData = [
  {
    id: 1,
    title: "React",
    description: "React is a JavaScript library for building user interfaces.",
    time: "2 days ago",
  },
  {
    id: 2,
    title: "React Router",
    description: "React Router is a routing library for React.",
    time: "2 days ago",
  },
  {
    id: 3,
    title: "React Hooks",
    description: "React Hooks are a new addition to the React 16.8 library.",
    time: "2 days ago",
  },
];

function Blogs() {
  return (
    <div className={style.container}>
    {fakeData.map((post) => (
      <div className={style.post}>
        <div>
          <h3>{post.title}</h3>
          <p>{post.description}</p>
        </div>
        <div>
          <p>{post.time}</p>
        </div>
      </div>
    ))}
    </div>
  )
}

export default Blogs
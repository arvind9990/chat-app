import React from "react";
import "./ChatSearch.css";

function ChatSearch({ onSearch }) {
  return (
    <section className="search-box">
      <div>
        <input
          type="text"
          placeholder="search user"
          onChange={(e) => onSearch(e.target.value)}
        />
        <i className="bi bi-search"></i>
      </div>
    </section>
  );
}

export default ChatSearch;
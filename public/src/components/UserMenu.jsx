// components/UserMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { BiDotsVerticalRounded, BiPowerOff } from "react-icons/bi";
import { logoutRoute } from "../utils/APIRoutes";
import axios from "axios";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setOpen(!open);

  const handleSetAvatar = () => {
    navigate("/setAvatar");
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      const id = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY))._id;
      const data = await axios.get(`${logoutRoute}/${id}`);
      if (data.status === 200) {
        localStorage.clear();
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error", error);
      alert("Logout failed.");
    }
  };

  return (
    <MenuWrapper>
      <DotsIcon onClick={toggleMenu} />
      {open && (
        <Dropdown>
          <DropdownItem onClick={handleSetAvatar}>Set Avatar</DropdownItem>
          <DropdownItem onClick={handleLogout}>
            <BiPowerOff style={{ marginRight: "5px" }} />
            Logout
          </DropdownItem>
        </Dropdown>
      )}
    </MenuWrapper>
  );
}

const MenuWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
`;

const DotsIcon = styled(BiDotsVerticalRounded)`
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 2.5rem;
  right: 0.5rem;
  background-color: #4e0eff;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  z-index: 100;
`;

const DropdownItem = styled.div`
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #997af0;
  }
`;

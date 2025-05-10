import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";
import loader from "../assets/loader.gif";

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const [customAvatar, setCustomAvatar] = useState(null); // For custom avatar
  const [imagePreview, setImagePreview] = useState(null); // For previewing custom image

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  // Check if user is logged in
  useEffect(() => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch avatars from DiceBear API and encode them in Base64
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const data = [];
        // Fetch 4 avatars using the DiceBear API
        for (let i = 0; i < 4; i++) {
          const seed = Math.random().toString(36).substring(7); // Generate random seed
          const svgUrl = `https://api.dicebear.com/8.x/adventurer/svg?seed=${seed}`;
          const response = await axios.get(svgUrl, {
            responseType: "text", // Ensure we get the SVG as text
          });

          // Convert the SVG to Base64 safely
          const base64 = btoa(unescape(encodeURIComponent(response.data)));
          data.push(base64);
        }

        setAvatars(data);
      } catch (error) {
        console.error("Failed to load avatars", error);
        toast.error("Failed to load avatars", toastOptions);

        // Fallback avatars in case of failure
        const fallbackAvatars = [
          "PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGnpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNmZmNjMDAiLz48Y2lyY2xlIGN4PSIzNSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjMDAwIi8+PGnpcmNsZSBjeD0iNjUiIGN5PSI0MCIgcj0iNSIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik00MCA2NSBxMTAgMTAgMjAgMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz48L3N2Zz4=",
          "PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGnpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiM0ZTBmZmYiLz48Y2lyY2xlIGN4PSIzNSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjZmZmIi8+PGnpcmNsZSBjeD0iNjUiIGN5PSI0MCIgcj0iNSIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0zNSA2NSBxMTUgMjAgMzAgMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiLz48L3N2Zz4=",
          "PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGnpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNlNjk5MDAiLz48Y2lyY2xlIGN4PSIzNSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjZmZmIi8+PGnpcmNsZSBjeD0iNjUiIGN5PSI0MCIgcj0iNSIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0zNSA2MCBxMTUgLTEwIDMwIDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIi8+PC9zdmc+",
          "PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGnpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNjYzAwZmYiLz48Y2lyY2xlIGN4PSIzNSIgY3k9IjQwIiByPSI1IiBmaWxsPSIjZmZmIi8+PGnpcmNsZSBjeD0iNjUiIGN5PSI0MCIgcj0iNSIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0zNSA2MCBxMTUgMTAgMzAgMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiLz48L3N2Zz4="
        ];
        setAvatars(fallbackAvatars);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result); // Base64 string of the uploaded image
        setImagePreview(reader.result); // Preview of the image
      };
      reader.readAsDataURL(file);
    }
  };

  const setProfilePicture = async () => {
    const imageToSend = customAvatar || avatars[selectedAvatar];

    if (!imageToSend) {
      toast.error("Please select or upload an avatar", toastOptions);
      return;
    }

    try {
      const user = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );

      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: imageToSend,
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(user)
        );
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    } catch (error) {
      toast.error("Error setting avatar. Please try again.", toastOptions);
    }
  };

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick or Upload an Avatar</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img
                  src={`data:image/svg+xml;base64,${avatar}`}
                  alt="avatar"
                />
              </div>
            ))}
          </div>
          {/* <div className="upload-avatar">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {imagePreview && <img src={imagePreview} alt="Uploaded preview" />}
          </div> */}
          <button onClick={setProfilePicture} className="submit-btn">
            Set as Profile Picture
          </button>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;
      cursor: pointer;

      img {
        height: 6rem;
        transition: 0.5s ease-in-out;
      }
    }
    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }

  .upload-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;

    input {
      margin: 1rem;
      background-color: #4e0eff;
      color: white;
      padding: 0.5rem;
      border: none;
      font-weight: bold;
      cursor: pointer;
      border-radius: 0.4rem;
      font-size: 1rem;
      text-transform: uppercase;
      transition: all 0.3s ease;
    }

    img {
      max-width: 200px;
      margin-top: 1rem;
    }
  }

  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: all 0.3s ease;

    &:hover {
      background-color: #3a0ca8;
    }
  }
`;

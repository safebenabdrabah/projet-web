import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../images/navbarlogo.png';
import Icon from "react-icons-kit";
import { cart } from 'react-icons-kit/entypo/cart';
import { auth, db } from "../config/Config";
import { doc, getDoc } from "firebase/firestore";

function Navbar() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);

                // Fetch user data from Firestore
                const userRef = doc(db, "SignedUpUserData", user.uid); // Use Firestore instance here
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUsername(userSnap.data().Username); // Retrieve 'username' from Firestore
                } else {
                    console.log("No such user document!");
                }
            } else {
                setUser(null);
                setUsername(""); // Reset username when user logs out
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = () => {
        auth.signOut().then(() => {
            navigate("/");  
        });
    };

    const handleLogoClick = () => {
        navigate("/");
    };

    const handleCategoryChange = (event) => {
        const categoryName = event.target.value;
        setSelectedCategory(categoryName); // Update selected category state
        if (categoryName) {
            navigate(`/category/${categoryName.toLowerCase()}`); // Navigate to the selected category
        }
    };
    return (
      <div className="navbox">
            <div className="leftside">
                <img src={logo} alt="yallashopLogo" onClick={handleLogoClick}/>
            </div>

            <div className="center">
                <div className="categories">
                   <select className="category-select" value={selectedCategory} onChange={handleCategoryChange}>
                        <option value="">Select Category</option>
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="home">Home</option>
                    </select>

                </div>
                <input type="text" placeholder="Search products..." className="search-bar" />
                <button className="search-btn">Search</button>
            </div>
            {user && <div className="rightside">
                <span><Link to="/profile" >{username }</Link></span>
                <span><Link to="/cartproducts"><Icon icon={cart}/></Link></span>
                <span><button className="logout-btn" onClick={logout}>LOGOUT</button></span>
            </div>}
        </div>
    );
}
export default Navbar ; 
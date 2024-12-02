import React, { useState } from "react";
import { collection, db, addDoc } from "../config/Config.js";
import { auth } from "../config/Config.js"; // Assuming Firebase Authentication is set up

function AddProducts() {
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("electronics");
    const [tags, setTags] = useState("");
    const [images, setImages] = useState([]);
    const [weight, setWeight] = useState("");
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e) => {
        const types = ["image/png", "image/jpeg"];
        const selectedFiles = Array.from(e.target.files);

        const validFiles = selectedFiles.filter((file) => types.includes(file.type));
        if (validFiles.length !== selectedFiles.length) {
            setError("Only PNG and JPEG image formats are allowed.");
            e.target.value = "";
            return;
        }
        setImages(validFiles);
        setError("");
    };

    const addProduct = async (e) => {
        e.preventDefault();

        if (!productName || !productPrice || !description || !category || images.length === 0 || !weight) {
            setError("All fields are required.");
            return;
        }

        setError("");
        setUploading(true);

        const formattedTags = tags.split(",").map((tag) => tag.trim());

        try {
            const base64Images = await Promise.all(
                images.map(
                    (image) =>
                        new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result); // Base64 string
                            reader.onerror = reject;
                            reader.readAsDataURL(image);
                        })
                )
            );

            // Retrieve logged-in user ID from Firebase Authentication
            const userId = auth.currentUser ? auth.currentUser.uid : null;

            if (!userId) {
                setError("User must be logged in to add a product.");
                setUploading(false);
                return;
            }

            // Firestore saving part
            const productsRef = collection(db, "products");

            const productDoc = {
                productName,
                productPrice: parseFloat(productPrice),
                description,
                category,
                tags: formattedTags,
                weight,
                images: base64Images,
                createdAt: new Date(),
                likes: 0, // Initialize likes to 0
                user: userId, // Assign the logged-in user's ID
            };

            await addDoc(productsRef, productDoc);
            console.log("Product added to Firestore:", productDoc);
            alert("Product successfully added!");

            // Clear form fields
            setProductName("");
            setProductPrice("");
            setDescription("");
            setCategory("electronics");
            setTags("");
            setImages([]);
            setWeight("");
        } catch (err) {
            console.error("Error uploading product:", err);
            setError("Failed to upload the product. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container">
            <form autoComplete="off" className="form-group" onSubmit={addProduct}>
                <label htmlFor="product-name">Product Name</label>
                <input
                    type="text"
                    className="form-control"
                    required
                    id="product-name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                />

                <label htmlFor="product-price">Product Price</label>
                <input
                    type="number"
                    className="form-control"
                    required
                    id="product-price"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                />

                <label htmlFor="product-description">Description</label>
                <textarea
                    className="form-control"
                    required
                    id="product-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>

                <label htmlFor="product-category">Category</label>
                <select
                    className="form-control"
                    id="product-category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home</option>
                </select>

                <label htmlFor="product-tags">Tags</label>
                <input
                    type="text"
                    className="form-control"
                    id="product-tags"
                    placeholder="Separate tags with commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />

                <label htmlFor="product-images">Product Images</label>
                <input
                    type="file"
                    className="form-control"
                    id="product-images"
                    multiple
                    onChange={handleImageChange}
                />

                <label htmlFor="shipping-weight">Shipping (Weight)</label>
                <input
                    type="text"
                    className="form-control"
                    id="shipping-weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                />

                <button className="btn btn-success btn-md mybtn" type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "ADD"}
                </button>
            </form>
            {error && <span>{error}</span>}
        </div>
    );
}

export default AddProducts;

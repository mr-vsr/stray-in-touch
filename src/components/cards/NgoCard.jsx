import React, { useState } from 'react';
import { db } from "../../auth/firebase-config";
import { doc, deleteDoc, collection, addDoc } from "firebase/firestore";

export default function NgoCard({ closeDialog, dataId }) {
    const [helpData, setHelpData] = useState({
        NgoName: "",
        Description: ""
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setHelpData({ ...helpData, [name]: value });
    };

    const pushHelpDescription = async () => {
        try {
            const requiredFields = ["NgoName", "Description"];
            const missingFields = requiredFields.filter(field => !helpData[field]);
            if (missingFields.length === 0) {
                const helpDataRef = await addDoc(collection(db, "helpData"), helpData);
                if (helpDataRef.id) {
                    setHelpData({
                        NgoName: "",
                        Description: "",
                    });
                    try {
                        await deleteDoc(doc(db, "strayInfo", dataId));
                        window.location.reload();
                        console.log("Document successfully deleted!");
                    } catch (error) {
                        console.error("Error deleting document: ", error);
                    }
                }
            } else {
                alert("Fill the required fields!");
            }
        } catch (error) {
            console.log("Error in ngo dialog card", error);
        }
    };

    return (
        <div className="dialog">
            <div className="dialog-content">
                <div className='dialog-close-btn-container'>
                    <span className="close" onClick={closeDialog}>&times;</span>
                </div>
                <input
                    name="NgoName"
                    type='text'
                    placeholder='ngo name'
                    onChange={handleChange}
                    value={helpData.NgoName}
                    required
                    className='dialog-ngoName'
                ></input>
                <input
                    name="Description"
                    type='text'
                    placeholder='description'
                    onChange={handleChange}
                    value={helpData.Description}
                    required
                    className='dialog-description'
                ></input>
                <button
                    className='dialog-button'
                    onClick={pushHelpDescription}
                > Helped
                </button>
            </div>
        </div>
    )
}

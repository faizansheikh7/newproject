import React, { useState } from 'react';
import axios from 'axios';

function Ocr() {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            setText('No file uploaded.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setLoading(true); // Set loading to true when the request starts

        try {
            const response = await axios.post('http://localhost:4000/api/ocr/process-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setText(response.data.extractedText);
        } catch (error) {
            console.error('Error uploading file:', error);
            setText(`An error occurred during processing: ${error.response?.data?.extractedText || error.message}`);
        } finally {
            setLoading(false); // Set loading to false when the request ends
            // Reset the file input and state
            setFile(null);
            document.getElementById('fileInput').value = '';
        }
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Prescription OCR</h1>
                <form onSubmit={handleSubmit}>
                    <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg mb-6 text-center">
                        <input
                            type="file"
                            className="hidden"
                            id="fileInput"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="fileInput" className="cursor-pointer text-gray-500">
                            Drag & drop image here or click to select file
                        </label>
                    </div>
                    <textarea
                        className="w-full h-60 p-4 border border-gray-300 rounded-lg mb-6"
                        placeholder="Extracted text will appear here..."
                        value={loading ? 'Processing...' : text} // Show "Processing..." when loading
                        readOnly
                    ></textarea>
                    <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
                        Process
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Ocr;
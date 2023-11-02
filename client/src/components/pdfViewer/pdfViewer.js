import React, { useState } from "react";
import { PDFDocument } from "pdf-lib"; // Import the necessary functions from pdf-lib

const Home = () => {
  const [pdfFileData, setPdfFileData] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const [pdfSrcDoc, setPdfSrcDoc] = useState(null);


  const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const renderPdf = (uint8array) => {
    const tempblob = new Blob([uint8array], { type: "application/pdf" });
    const docUrl = URL.createObjectURL(tempblob);
    setPdfFileData(docUrl);
  };

  const extractPdfPage = async (arrayBuff) => {
    try {
      const loadedPdfSrcDoc = await PDFDocument.load(arrayBuff);
      setPdfSrcDoc(loadedPdfSrcDoc); // Store pdfSrcDoc in component state
      const pdfNewDoc = await PDFDocument.create();
      
      // Copy all pages instead of a specific range
      const pages = await pdfNewDoc.copyPages(loadedPdfSrcDoc, loadedPdfSrcDoc.getPageIndices());
      
      pages.forEach((page) => pdfNewDoc.addPage(page));
      const newpdf = await pdfNewDoc.save();
      return newpdf;
    } catch (error) {
      setErrorMessage("Error extracting PDF pages.");
      console.error(error);
      return null;
    }
  }

  const onFileSelected = async (e) => {
    setErrorMessage(""); // Clear any previous error messages
    setSelectedPages([]); // Clear selected pages
    const fileList = e.target.files;
    if (fileList?.length > 0) {
      try {
        const pdfArrayBuffer = await readFileAsync(fileList[0]);
        const newPdfDoc = await extractPdfPage(pdfArrayBuffer);
        if (newPdfDoc) {
          renderPdf(newPdfDoc);
        }
      } catch (error) {
        setErrorMessage("Error loading or processing the selected PDF file.");
        console.error(error);
      }
    }
  };

  const handleCheckboxChange = (pageIndex) => {
    if (selectedPages.includes(pageIndex)) {
      setSelectedPages(selectedPages.filter((page) => page !== pageIndex));
    } else {
      setSelectedPages([...selectedPages, pageIndex]);
    }
  };

  const createNewPdfWithSelectedPages = async () => {
    setErrorMessage(""); // Clear any previous error messages
    if (selectedPages.length === 0) {
      setErrorMessage("Please select at least one page.");
      return;
    }
  
    const fileList = document.getElementById("file-selector").files;
    if (fileList?.length > 0) {
      try {
        const pdfArrayBuffer = await readFileAsync(fileList[0]);
        const pdfSrcDoc = await PDFDocument.load(pdfArrayBuffer);
        console.log("Source PDF Document:", pdfSrcDoc);
        if (!pdfSrcDoc) {
          setErrorMessage("Error loading the source PDF document.");
          return;
        }
  
        const pdfNewDoc = await PDFDocument.create();
        console.log("Copied Pages:", pdfNewDoc.getPages());

        if (!pdfNewDoc) {
          setErrorMessage("Error creating the new PDF document.");
          return;
        }
  
        const pageCount = pdfSrcDoc.getPageCount();
  
        selectedPages.forEach((pageIndex) => {
          if (pageIndex < pageCount) {
            const pageToCopy = pdfSrcDoc.getPages()[pageIndex];
            const copiedPage = pdfNewDoc.copyPages(pdfSrcDoc, [pageToCopy])[0];
            pdfNewDoc.addPage(copiedPage);
          } else {
            console.error(`Page index ${pageIndex} is out of bounds.`);
          }
        });
  
        const newPdfData = await pdfNewDoc.save();
        renderPdf(newPdfData);
      } catch (error) {
        setErrorMessage("Error creating the new PDF file.");
        console.error("General error:", error);
      }
    }
  };
  
  

  return (
    <>
      
      <input type="file" id="file-selector" accept=".pdf" onChange={onFileSelected} />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <div>
        {pdfFileData && (
          <iframe
            style={{ display: "block", width: "100%", height: "500px" }}
            title="PdfFrame"
            src={pdfFileData}
            frameBorder="0"
            type="application/pdf"
          ></iframe>
        )}
        {pdfFileData && (
          <div>
            <h2>Select Pages:</h2>
            {Array.from({ length: pdfSrcDoc.getPageCount() }, (_, pageIndex) => (
              <label key={pageIndex}>
                <input
                  type="checkbox"
                  checked={selectedPages.includes(pageIndex)}
                  onChange={() => handleCheckboxChange(pageIndex)}
                />
                Page {pageIndex + 1}
              </label>
            ))}
            <button onClick={createNewPdfWithSelectedPages}>Create New PDF</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;

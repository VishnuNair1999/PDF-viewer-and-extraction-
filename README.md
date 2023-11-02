PDF VIEWER AND PAGE EXTRACTION

In this project, there are 2 main objective 
1. A PDF viewer
2. Selection of pages from the PDF and extracting them to  create a new PDF


Here's what this code does:

1.Users can select a PDF file using an input field with the accept pdf attribute.

2.When a PDF file is selected, the onFileSelected function is called.
It reads the selected PDF file as an ArrayBuffer and extracts specific pages from it using the pdf-lib library. In this project , it extracts pages and combines them into a new PDF document.

3.The new PDF document is then displayed in an iframe for the user to view.

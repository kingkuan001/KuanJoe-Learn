document.addEventListener("DOMContentLoaded", function () {
    const pdfList = document.getElementById("pdfList");
    const questionInput = document.getElementById("question");
    const answerBox = document.getElementById("answer");
    const searchButton = document.getElementById("searchButton");
    const loader = document.getElementById("loadingSpinner");

    searchButton.addEventListener("click", function () {
        const selectedPdf = pdfList.value;
        if (!selectedPdf) {
            alert("Please select a PDF");
            return;
        }

        answerBox.textContent = "Please wait...";
        loader.style.display = "block";

        // Construct the correct Raw URL for GitHub
        const pdfPath = `https://raw.githubusercontent.com/kingkuan001/KuanJoe-Learn/main/${selectedPdf}`;

        extractTextFromPDF(pdfPath);
    });

    function extractTextFromPDF(pdfPath) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument(pdfPath);
        loadingTask.promise.then(pdf => {
            let textContent = "";
            const promises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                promises.push(pdf.getPage(i).then(page => {
                    return page.getTextContent().then(content => {
                        content.items.forEach(item => {
                            textContent += item.str + " ";
                        });
                    });
                }));
            }

            Promise.all(promises).then(() => {
                searchAnswer(textContent);
            }).catch(error => {
                console.error("Error processing PDF pages: ", error);
                answerBox.textContent = "Error reading the document.";
            }).finally(() => {
                loader.style.display = "none";
            });
        }).catch(error => {
            console.error("Error loading PDF: ", error);
            answerBox.textContent = "Error loading the document. Make sure the file exists.";
            loader.style.display = "none";
        });
    }

    function searchAnswer(textContent) {
        const query = questionInput.value.trim().toLowerCase();
        if (!query) {
            alert("Please enter a question");
            loader.style.display = "none";
            return;
        }

        const sentences = textContent.split(/\.|\n/);
        let bestMatch = "No relevant answer found.";

        for (let sentence of sentences) {
            if (sentence.toLowerCase().includes(query)) {
                bestMatch = sentence.trim();
                break;
            }
        }

        answerBox.textContent = bestMatch;
    }
});

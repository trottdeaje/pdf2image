var __PDF_DOC,
  __CURRENT_PAGE,
  __TOTAL_PAGES,
  __PAGE_RENDERING_IN_PROGRESS = 0,
  __CANVAS = $("#pdf-canvas").get(0),
  __CANVAS_CTX = __CANVAS.getContext("2d");
// const pageLocation = window.location.origin;
// console.log(pageLocation);
// const returnHome = document.getElementById("return-home");
document.getElementById("return-home").href = window.location.origin;

$("#download-image").hide();

function showPDF(pdf_url) {
  $("#pdf-loader").show();

  PDFJS.getDocument({ url: pdf_url })
    .then(function (pdf_doc) {
      __PDF_DOC = pdf_doc;
      __TOTAL_PAGES = __PDF_DOC.numPages;

      // Hide the pdf loader and show pdf container in HTML
      $("#pdf-loader").hide();
      $("#pdf-contents").show();
      $("#pdf-total-pages").text(__TOTAL_PAGES);

      // Show the first page
      showPage(1);
    })
    .catch(function (error) {
      // If error re-show the upload button
      $("#pdf-loader").hide();
      $("#upload-button").show();

      alert(error.message);
    });
}

function showPage(page_no) {
  __PAGE_RENDERING_IN_PROGRESS = 1;
  __CURRENT_PAGE = page_no;

  // Disable Prev & Next buttons while page is being loaded
  $("#pdf-next, #pdf-prev").attr("disabled", "disabled");

  // While page is being rendered hide the canvas and show a loading message
  $("#pdf-canvas").hide();
  $("#page-loader").show();
  $("#download-image").hide();

  // Update current page in HTML
  $("#pdf-current-page").text(page_no);

  // Fetch the page
  __PDF_DOC.getPage(page_no).then(function (page) {
    // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
    var scale_required = __CANVAS.width / page.getViewport(1).width;

    // Get viewport of the page at required scale
    var viewport = page.getViewport(scale_required);

    // Set canvas height
    __CANVAS.height = viewport.height;

    var renderContext = {
      canvasContext: __CANVAS_CTX,
      viewport: viewport,
    };

    // Render the page contents in the canvas
    page.render(renderContext).then(function () {
      __PAGE_RENDERING_IN_PROGRESS = 0;

      // Re-enable Prev & Next buttons
      $("#pdf-next, #pdf-prev").removeAttr("disabled");

      // Show the canvas and hide the page loader
      $("#pdf-canvas").show();
      $("#page-loader").hide();
      $("#download-image").show();
      $("#info-text").html("Download Your Image");
      $("#upload-img-text").html("Choose another PDF");
      $("#upload-button").css("width", "200");
      $("#return-home-container").show();
      setTimeout(function () {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 250);
    });
  });
}

// Upon click this should should trigger click on the #file-to-upload file input element
// This is better than showing the not-good-looking file input element
$("#upload-button").on("click", function () {
  $("#file-to-upload").trigger("click");
});

// When user chooses a PDF file
$("#file-to-upload").on("change", function () {
  // Validate whether PDF
  if (
    ["application/pdf"].indexOf($("#file-to-upload").get(0).files[0].type) == -1
  ) {
    alert("Error: Not a PDF Document.");
    return;
  }

  // Send the object url of the pdf
  showPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]));
});

// Previous page of the PDF
$("#pdf-prev").on("click", function () {
  if (__CURRENT_PAGE != 1) showPage(--__CURRENT_PAGE);
});

// Next page of the PDF
$("#pdf-next").on("click", function () {
  if (__CURRENT_PAGE != __TOTAL_PAGES) showPage(++__CURRENT_PAGE);
});

// Download button
$("#download-image").on("click", function () {
  $(this)
    .attr("href", __CANVAS.toDataURL())
    .attr("download", "safekey-upload-me.png");
});

const uploadBtn = document.getElementById("upload-button");

uploadBtn.addEventListener("mouseenter", () => {
  document.getElementById("upload-img").src = "./resources/file-white.svg";
});
uploadBtn.addEventListener("mouseleave", () => {
  document.getElementById("upload-img").src = "./resources/file.svg";
});

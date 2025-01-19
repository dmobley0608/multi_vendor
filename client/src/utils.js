export const printInvoice = () =>{
    const printContents = document.getElementById('invoice').innerHTML;
    const originalContents = document.body.innerHTML;
    const printStyles = `
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .text-end {
          text-align: right;
        }
        input{
        border: none;
        }
        select{
          border: none;
        }
        .fw-bold {
          font-weight: bold;
        }
        .no-print {
          display: none;
        }
      </style>
    `;
    const newWindow = window.open('', '', 'height=500, width=500');
    newWindow.document.write('<html><head><title>Invoice</title>');
    newWindow.document.write(printStyles);
    newWindow.document.write('</head><body >');
    newWindow.document.write(printContents);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
}
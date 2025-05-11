# cyclagear-spreadsheet-parser
A Node app for condensing and moving the data from certain spreadheets downloaded from eBay into a new spreadheet with a predefined format. This predefined format is particular to my shop, so if you're an eBay seller, this little app probably won't exactly fit your needs, but I hope is might serve as an inspiration for something that will. Or more generally, this code could serve as an example of how to process CSV files in Vanilla Javascript.

**To Set Up this application**
 - Install node.js.
 - Clone or download this repo.
 - In the folder you just cloned or downloaded, run
 ```
 npm install
 ```
 - At the top level of the cloned folder (where this README resides) add a file called *.env*. Inside that folder, specify the path where you'll download the spreadsheets from eBay. For example
 ```
BASE_REPORTS_PATH=C:\Users\<your username>\Documents\ebay-reports
 ``` 

**To run this Application**
 - In the folder you specified in BASE_REPORTS_PATH, create a folder named after the date for which you're downloading sales data. Use format *mm-dd-yy*.
 - Go to your shop on eBay and download the following CSV files to the folder you just created:
    orders.csv
    ad-fees.csv
    shipping-labels.csv
 - In the location where you installed this app, run type command
 ```
 npm run generate-report -- <mm-dd-yy>
 ```
 where the argument at the end is the date of the sales data you want.
 - Look in the folder where you put your sales data. It should contain a new CSV file called *newRows-<mm-dd-yy>*. That's your output! :)
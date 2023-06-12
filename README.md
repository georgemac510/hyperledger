[//]: # (SPDX-License-Identifier: CC-BY-4.0)

# Asset transfer basic sample

The asset transfer basic sample demonstrates:

- Connecting a client application to a Fabric blockchain network.
- Submitting smart contract transactions to update ledger state.
- Evaluating smart contract transactions to query ledger state.
- Handling errors in transaction invocation.

## About the sample

This sample includes smart contract and application code in multiple languages. This sample shows create, read, update, transfer and delete of an asset.

For a more detailed walk-through of the application code and client API usage, refer to the [Running a Fabric Application tutorial](https://hyperledger-fabric.readthedocs.io/en/latest/write_first_app.html) in the main Hyperledger Fabric documentation.

### Application

Follow the execution flow in the client application code, and corresponding output on running the application. Pay attention to the sequence of:

- Transaction invocations (console output like "**--> Submit Transaction**" and "**--> Evaluate Transaction**").
- Results returned by transactions (console output like "**\*\*\* Result**").

### Smart Contract

The smart contract (in folder `chaincode-xyz`) implements the following functions to support the application:

- CreateAsset
- ReadAsset
- UpdateAsset
- DeleteAsset
- TransferAsset

Note that the asset transfer implemented by the smart contract is a simplified scenario, without ownership validation, meant only to demonstrate how to invoke transactions.

## Running the sample

The Fabric test network is used to deploy and run this sample. Follow these steps in order:

1. Create the test network and a channel (from the `test-network` folder).
   ```
   ./network.sh down

   ./network.sh up createChannel -c mychannel -ca
   ```
For javascript:

   ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript

2. Change directory to `application-javascript`

   cd ../asset-transfer-basic/application-javascript/


3. Set admin user:

Delete the wallet/ directory in application-javascript/

   npm start
   Sign in
   admin
   admin

* This will give an error, but creates your admin password

4. Set new user

Click on the 3 lines at the top-right and go to `Register`.

Add a user name (in my case John), then choose `Creator`, then hit submit.

Go into `wallet/` and create a new file `user-password.txt`. Copy and paste the `privateKey` from your `user.id` file into `user-password.txt`. Remove all instances of `\r\n` in the `privateKey`, then save the file.

Logout

5. Log into the app with your new username and password from `user-password.txt`

6. Click on 3 lines at the top-right again and choose `Add asset`. Fill in the data requested, upload vehicle image and hit submit. Your image will be uploaded to IPFS and will render when you click on `All assets`, then `view` next to the newly added asset.


## General directions from Hyperledger Fabric samples

1. Deploy one of the smart contract implementations (from the `test-network` folder).
   ```
   # To deploy the TypeScript chaincode implementation
   ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-typescript/ -ccl typescript

   # To deploy the Go chaincode implementation
   ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go/ -ccl go

   # To deploy the Java chaincode implementation
   ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-java/ -ccl java
   ```

1. Run the application (from the `asset-transfer-basic` folder).
   ```
   # To run the Typescript sample application
   cd application-gateway-typescript
   npm install
   npm start

   # To run the Go sample application
   cd application-gateway-go
   go run .

   # To run the Java sample application
   cd application-gateway-java
   ./gradlew run
   ```

## Clean up

When you are finished, you can bring down the test network (from the `test-network` folder). The command will remove all the nodes of the test network, and delete any ledger data that you created.

```
./network.sh down
```
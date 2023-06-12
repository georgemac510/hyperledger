//var path=require('path')
const express=require('express');
const router=express.Router();

// The router object is used in web applications to handle requests. 
// router.post() refers to POST requests and router.get() referes to GET request.
// The difference between the two is that a GET request, is requesting data from a specified source and a POST 
// request submits data to a specified resource to be processed.
// For example when you load a sign up page, that is a GET request as you are requesting data from the server 
// and when you submit that form it's a POST request as your inputted data will be processed and assorted into 
// a database, etc.

router.get('/display',function(req,res){
    // The purpose of "use strict" is to indicate that the code should be executed in "strict mode". 
    // With strict mode, you cannot, for example, use undeclared variables.
	'use strict';

    // fabric-network package encapsulates the APIs to connect to a Fabric network, submit transactions and 
    // perform queries against the ledger, and listen for or replay events.
    // fabric-ca-client, to interact with the fabric-ca to manage user certificates.
	const { Gateway, Wallets } = require('fabric-network');
	const FabricCAServices = require('fabric-ca-client');
    // Nodejs provides you with the path module that allows you to interact with file paths easily. 
    // The path module has many useful properties and methods to access and manipulate paths in the file system.
	const path = require('path');
    // the second ../ represents asset-transfer-basic folder
    // the first ../ represents fabric-samples that contains test-application folder
    // buildCAClient: Create a new CA client for interacting with the CA.
	const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
	const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

	const channelName = 'mychannel';
	const chaincodeName = 'basic';
	const mspOrg1 = 'Org1MSP';
	const walletPath = path.join(__dirname, 'wallet');
    const org1UserId = req.session.userid;
    
    console.log(req.session);

	function prettyJSONString(inputString) {
		return JSON.stringify(JSON.parse(inputString), null, 2);
	}

    async function main() {
		try {
            if(org1UserId === undefined){
                res.render('login_form',{
                    errors:"Please log in to see list of assets."
                })
                return;
            }

			// build an in memory object with the network configuration (also known as a connection profile)
			const ccp = buildCCPOrg1();

			// build an instance of the fabric ca services client based on
			// the information in the network configuration
			const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

			// setup the wallet to hold the credentials of the application user
			const wallet = await buildWallet(Wallets, walletPath);

			// in a real application this would be done on an administrative flow, and only once
			await enrollAdmin(caClient, wallet, mspOrg1);

			// in a real application this would be done only when a new user was required to be added
			// and would be part of an administrative flow
			await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

			// Create a new gateway instance for interacting with the fabric network.
			// In a real application this would be done as the backend server session is setup for
			// a user that has been verified.
			const gateway = new Gateway();

			try {
				// setup the gateway instance
				// The user will now be able to create connections to the fabric network and be able to
				// submit transactions and query. All transactions submitted by this gateway will be
				// signed by this user using the credentials stored in the wallet.
				await gateway.connect(ccp, {
					wallet,
					identity: org1UserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Let's try a query type operation (function).
				// This will be sent to just one peer and the results will be shown.
				console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
				let result = await contract.evaluateTransaction('GetAllAssets');
				console.log(`*** Result: ${prettyJSONString(result.toString())}`);

                var data=result.toString();
                console.log(data);                
                var data2=[];
                var label=[];
                var values=[];
                // remove {} [] "" from the fetched dataset
                for(var i=0;i<data.length;i++)
                {
                    if(data[i]!='{' && data[i]!='}' && data[i]!='{' && data[i]!='"' && data[i]!='[' && data[i]!=']')
                    {
                        data2.push(data[i]);
                        //console.log(data[i]); // removes {} [] ""
                    }
                }

                // Get Labels (Appraised Value, color, id and so on)
                var string;
                var j;
                for (var i=0; i < data2.length; i++)
                {
                    string="";
                    if (i==0 || data2[i]==',')
                    {
                        // Eliminite the word 'Record' from the result
                        if(data2[i+1]=='R' && data2[i+2]=='e' && data2[i+3]=='c' && data2[i+4]=='o' && data2[i+5]=='r' && data2[i+6]=='d') 
                        {
                            i+=7;
                        }
                        if (i==0)
                        {
                            j=i;
                        }
                        else
                        {
                            j=i+1;
                        }
                        while(data2[j] != ':')
                        {
                            string += data2[j];
                            j++;
                        }
                        label.push(string);
                        i = --j;
                        //console.log(string);
                    }
                }
                // Get Values (300, blue, asset1 and so on)
                for(var i=0; i < data2.length; i++)
                {
                    string="";
                    if(data2[i]==':')
                    {
                        // Remove text 'x509::CN='
                        if(data2[i+1]=='x' && data2[i+2]=='5' && data2[i+3]=='0' && data2[i+4]=='9' && data2[i+5]==':' && data2[i+6]==':' && data2[i+7]=='C' && data2[i+8]=='N' && data2[i+9]=='=')
                        {
                            i += 9;
                        }
                        // Remove text ':CN=ca.org1.example.com'
                        if(data2[i+1]==':' && data2[i+2]=='C' && data2[i+3]=='N' && data2[i+4]=='=' && data2[i+5]=='c' && data2[i+6]=='a' && data2[i+7]=='.' && data2[i+8]=='o' && data2[i+9]=='r' && data2[i+10]=='g' && data2[i+11]=='1' && data2[i+12]=='.' && data2[i+13]=='e' && data2[i+14]=='x' && data2[i+15]=='a' && data2[i+16]=='m' && data2[i+17]=='p' && data2[i+18]=='l' && data2[i+19]=='e' && data2[i+20]=='.' && data2[i+21]=='c' && data2[i+22]=='o' && data2[i+23]=='m')
                        {
                           i += 24;
                        }
                        // Remove O=org1.example.com    
                        if(data2[i+1]=='O' && data2[i+2]=='=' && data2[i+3]=='o' && data2[i+4]=='r' && data2[i+5]=='g' && data2[i+6]=='1' && data2[i+7]=='.' && data2[i+8]=='e' && data2[i+9]=='x' && data2[i+10]=='a' && data2[i+11]=='m' && data2[i+12]=='p' && data2[i+13]=='l' && data2[i+14]=='e' && data2[i+15]=='.' && data2[i+16]=='c' && data2[i+17]=='o' && data2[i+18]=='m')
                        {
                           i += 18;
                        }

                        j = i + 1;
                        while(data2[j] != ',')
                        {
                            if(j==data2.length-1)
                            {
                                string += data2[j];
                                break;
                            }
                            string += data2[j];
                            j++;
                        }
                        if (string != '') {
                            values.push(string);
                        }
                        i = --j;
                        //console.log(string);
                    }
                }

                // Call display.ejs file to show the list of assets
                res.render('display',{
                    label: label,
                    values:values
                });

			} finally {
				// Disconnect from the gateway when the application is closing
				// This will close all connections to the network
				gateway.disconnect();
			}
		} catch (error) {
			console.error(`******** FAILED to run the application: ${error}`);
		}
	}
	main();
})


router.get('/insert_form', function(req,res){
    res.render('insert_form',{
        errors:{},
        success:{}
    })
})

// Server-side validations
router.post('/create_asset', function(req,res){
    var errors=[];
    if(!req.body.id){
        //console.log('Car ID is: '+req.body.id);
        errors.push("ID must be provided");
    }
    if(!req.body.color){
        errors.push("Color must be provided");
    }
    if(!req.body.size){
        errors.push("Size must be provided");
    }
    if(!req.body.value){
        errors.push("Value must be provided");
    }
    if(!req.body.file){
        errors.push("Select an image file to upload");
    }
    if(errors.length > 0)
    {
        res.render('insert_form',{
            errors:errors,
            success:{}
        })
    }
    else
    {
        'use strict';

        const { Gateway, Wallets } = require('fabric-network');
        const FabricCAServices = require('fabric-ca-client');
        const path = require('path');
        const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
        const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
        
        const channelName = 'mychannel';
        const chaincodeName = 'basic';
        const mspOrg1 = 'Org1MSP';
        const walletPath = path.join(__dirname, 'wallet');
        const org1UserId = req.session.userid;

        async function main() {
            try {
                if(org1UserId === undefined){
                    res.render('login_form',{
                        errors:"Please log in to add a new record.",
                        success:{}
                    })
                    return;
                }

                try {
                    const ccp = buildCCPOrg1();
                    const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
                    const wallet = await buildWallet(Wallets, walletPath);
                    await enrollAdmin(caClient, wallet, mspOrg1);
                    await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
                    const gateway = new Gateway();

                    await gateway.connect(ccp, {
                        wallet,
                        identity: org1UserId,
                        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
                    });
    
                    const network = await gateway.getNetwork(channelName);
                    const contract = network.getContract(chaincodeName);
    
                    const attrvalue = await contract.evaluateTransaction('getattributevalue');
                    console.log("The value of role attribute is:::::::::::" + attrvalue);

                    if(attrvalue != 'creator'){
                        res.render('insert_form',{
                            errors:"You do not possess the creator role to add a new record.",
                            success:{}
                        })
                        return;
                    }
            
                    try {
                        const fs = require('fs');
                        const create = require('ipfs-http-client');
                        // Details about project id and project secret are provided in the book
                        const projectId = '2M99YiBQFV3g06yXU9MFV9KO4ZY'
                        const projectSecret = '0453e4c08c3a45f8947e9d12ade09776'
                        const projectIdAndSecret = `${projectId}:${projectSecret}`
                        const ipfsClient = create({
                            host: 'ipfs.infura.io',
                            port: 5001,
                            protocol: 'https',
                            headers: {
                              authorization: `Basic ${Buffer.from(projectIdAndSecret).toString(
                                'base64'
                              )}`,
                            },
                          })
                        const file = fs.readFileSync(req.body.file);
                        const buffer = Buffer.from(file);
                        //console.log(buffer);
                        const cid = await ipfsClient.add(buffer);
                        // Note: (node:75967) ExperimentalWarning: The Fetch API is an experimental feature. This feature could change at any time
                        // (Use `node --trace-warnings ...` to show where the warning was created)
                        // Remedy: Downgrade Node: nvm install 10.23.0 and nvm use 10.23.0
                        // Now let's try to submit a transaction.
                        // This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
                        // to the orderer to be committed by each of the peer's to the channel ledger.
                        for await (const item of cid) {
                            console.log(JSON.stringify(item));
                            const filePath = JSON.stringify(item).substring(9,55);
                            console.log('Value of filePath is:',filePath);
                            console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, appraisedValue, date, type, and image arguments');
                            await contract.submitTransaction('CreateAsset', req.body.id, req.body.color, req.body.size, org1UserId, req.body.value, filePath);
                            return;
                        } 
                    } finally {
                        // Disconnect from the gateway when the application is closing
                        // This will close all connections to the network
                        gateway.disconnect();
                        res.render('insert_form',{
                            errors:{},
                            success:"Asset record added successfully."
                        })
                    }
                } catch (error) {
                    console.error(`******** FAILED to run the application >>>>>: ${error}`);
                }
            } catch (error) {
                console.error(`******** FAILED to run the application: ${error}`);
            }
        }
        main();
    }
})

router.get('/update_form', function(req,res){
    res.render('update_form',{
        errors:{},
        success:{}
    })
})

// Server-side validations
router.post('/update_asset', function(req,res){
    var errors=[];
    if(!req.body.id){
        errors.push("ID must be provided");
    }
    if(!req.body.color){
        errors.push("Color must be provided");
    }
    if(!req.body.size){
        errors.push("Size must be provided");
    }
    if(!req.body.value){
        errors.push("Value must be provided");
    }
    if(errors.length > 0)
    {
        res.render('update_form',{
            errors:errors,
            success:{}
        })
    }
    else
    {
        'use strict';

        const { Gateway, Wallets } = require('fabric-network');
        const FabricCAServices = require('fabric-ca-client');
        const path = require('path');
        const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
        const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
        
        const channelName = 'mychannel';
        const chaincodeName = 'basic';
        const mspOrg1 = 'Org1MSP';
        const walletPath = path.join(__dirname, 'wallet');
        const org1UserId = req.session.userid;

        async function main() {
            try {
                if(org1UserId === undefined){
                    res.render('login_form',{
                        errors:"Please log in to update an asset.",
                        success:{}
                    })
                    return;
                }

                try {
                    const ccp = buildCCPOrg1();
                    const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
                    const wallet = await buildWallet(Wallets, walletPath);
                    await enrollAdmin(caClient, wallet, mspOrg1);
                    await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
                    const gateway = new Gateway();

                    await gateway.connect(ccp, {
                        wallet,
                        identity: org1UserId,
                        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
                    });
    
                    const network = await gateway.getNetwork(channelName);
                    const contract = network.getContract(chaincodeName);
    
                    const attrvalue = await contract.evaluateTransaction('getattributevalue');

                    if(attrvalue != 'creator'){
                        res.render('update_form',{
                            errors:"You do not possess the creator role to update an asset.",
                            success:{}
                        })
                        return;
                    }
                    // Check asset owner
                    const assetOwner = await contract.evaluateTransaction('checkOwner', req.body.id);
                    if (assetOwner != org1UserId) {
                        res.render('update_form',{
                            errors:"You do not own the asset",
                            success:{}
                        })
                        return;
                    }
                    
                    try {
                        const fs = require('fs');
                        const create = require('ipfs-http-client');
                        const projectId = '2M99YiBQFV3g06yXU9MFV9KO4ZY'
                        const projectSecret = '0453e4c08c3a45f8947e9d12ade09776'
                        const projectIdAndSecret = `${projectId}:${projectSecret}`
                        const ipfsClient = create({
                            host: 'ipfs.infura.io',
                            port: 5001,
                            protocol: 'https',
                            headers: {
                              authorization: `Basic ${Buffer.from(projectIdAndSecret).toString(
                                'base64'
                              )}`,
                            },
                        })
                        const file = fs.readFileSync(req.body.file);
                        const buffer = Buffer.from(file);
                        const cid = await ipfsClient.add(buffer);
                        for await (const item of cid) {
                            console.log(JSON.stringify(item));
                            const filePath = JSON.stringify(item).substring(9,55);
                            console.log('Value of filePath is:',filePath);
                            console.log('\n--> Submit Transaction: UpdateAsset, updates an existing asset');
                            await contract.submitTransaction('UpdateAsset', req.body.id, req.body.color, req.body.size, org1UserId, req.body.value, filePath);
                            return;
                        }
                    } finally {
                        // Disconnect from the gateway when the application is closing
                        // This will close all connections to the network
                        gateway.disconnect();
                        res.render('update_form',{
                            errors:{},
                            success:"Asset record updated successfully."
                        })
                    }
                } catch (error) {
                    console.error(`******** FAILED to run the application: ${error}`);
                }
            } catch (error) {
                console.error(`******** FAILED to run the application: ${error}`);
            }
        }
        main();
    }
})

router.get('/delete_form', function(req,res){
    res.render('delete_form',{
        errors:{},
        success:{}
    })
})
router.post('/delete_asset', function(req,res){
    var errors=[];
    if(!req.body.id){
        errors.push("Asset ID must be provided");
    }
    if(errors.length > 0){
        res.render('delete_form',{
            errors:errors,
            success:{}
        })
    }
    else
    {
        'use strict';

        const { Gateway, Wallets } = require('fabric-network');
        const FabricCAServices = require('fabric-ca-client');
        const path = require('path');
        const { buildCAClient} = require('../../test-application/javascript/CAUtil.js');
        const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
        
        const channelName = 'mychannel';
        const chaincodeName = 'basic';
        const walletPath = path.join(__dirname, 'wallet');
        const org1UserId = req.session.userid;
        
        async function main() {
            try {
                if(org1UserId === undefined){
                    res.render('login_form',{
                        errors:"Please log in to delete the asset.",
                        success:{}
                    })
                    return;
                }
                try {
                    const ccp = buildCCPOrg1();
                    const wallet = await buildWallet(Wallets, walletPath);
                    const gateway = new Gateway();
                    await gateway.connect(ccp, {
                        wallet,
                        identity: org1UserId,
                        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
                    });

                    const network = await gateway.getNetwork(channelName);
                    const contract = network.getContract(chaincodeName);
                    const attrvalue = await contract.evaluateTransaction('getattributevalue');
                    if(attrvalue != 'creator'){
                        res.render('delete_form',{
                            errors:"You do not possess the creator role to delete an asset.",
                            success:{}
                        })
                        return;
                    }
                    // Check asset owner
                    const assetOwner = await contract.evaluateTransaction('checkOwner', req.body.id);
                    if (assetOwner != org1UserId) {
                        res.render('delete_form',{
                            errors:"You do not own the asset",
                            success:{}
                        })
                        return;
                    }

                    try {
                        await contract.submitTransaction('DeleteAsset', req.body.id);
                        console.log('*** Result: committed');
                    } finally {
                        // Disconnect from the gateway when the application is closing
                        // This will close all connections to the network
                        gateway.disconnect();
                        res.render('delete_form',{
                            errors:{},
                            success:"Asset record deleted successfully!"
                        })
                    }
                } catch (error) {
                    console.error(`******** FAILED to run the application: ${error}`);
                    res.render('delete_form',{
                        errors:"Error occured while deleting asset",
                        success:{}
                    })
                }
            } catch (error) {
                console.error(`******** FAILED to run the application: ${error}`);
            }
        }
        main();
    }
})

router.get('/search_form', function(req,res){
    res.render('search_form',{
        errors:{}
    })
})

router.post('/search_asset', function(req,res){
    var errors=[];
    if(!req.body.id){
        errors.push("Asset ID must be provided");
    }
    if(errors.length > 0){
        res.render('search_form',{
            errors:errors
        })
    }
    else
    {
        'use strict';

        const { Gateway, Wallets } = require('fabric-network');
        const FabricCAServices = require('fabric-ca-client');
        const path = require('path');
        const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
        
        const channelName = 'mychannel';
        const chaincodeName = 'basic';
        const walletPath = path.join(__dirname, 'wallet');
        const org1UserId = req.session.userid;
        
        async function main() {
            try {
                if(org1UserId === undefined){
                    res.render('login_form',{
                        errors:"Please log in to search records.",
                        success:{}
                    })
                    return;
                }
                try {
                    const ccp = buildCCPOrg1();
                    const wallet = await buildWallet(Wallets, walletPath);
                    const gateway = new Gateway();
            
                    try {
                        await gateway.connect(ccp, {
                            wallet,
                            identity: org1UserId,
                            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
                        });

                        const network = await gateway.getNetwork(channelName);
                        const contract = network.getContract(chaincodeName);
        
                        result = await contract.evaluateTransaction('ReadAsset', req.body.id);

                        var data=result.toString();
                        var data2=[];
                        var label=[];
                        var values=[];
                        // remove {} [] ""
                        for(var i=0;i<data.length;i++)
                        {
                            if(data[i]!='{' && data[i]!='}' && data[i]!='{' && data[i]!='"' && data[i]!='[' && data[i]!=']')
                            {
                                data2.push(data[i]);
                                //console.log(data[i]); // removes {} [] ""
                            }
                        }

                        for (var i=0; i < 8; i++)
                        {
                            if (i==0)
                            {
                                label.push('Value');
                            }
                            if (i==1)
                            {
                                label.push('Color');
                            }
                            if (i==2)
                            {
                                label.push('Asset ID');
                            }
                            if (i==3)
                            {
                                label.push('Owner');
                            }
                            if (i==4)
                            {
                                label.push('Size');
                            }
                            if (i==5)
                            {
                                label.push('Date');
                            }
                            if (i==6)
                            {
                                label.push('Type');
                            }
                            if (i==7)
                            {
                                label.push('Image');
                            }
                        }                    

                        // Get Values (CAR0, Toyota, Prius, blue, Tomoko)
                        for(var i=0; i < data2.length; i++)
                        {
                            string="";
                            if(data2[i]==':')
                            {
                                if(data2[i+1]=='x' && data2[i+2]=='5' && data2[i+3]=='0' && data2[i+4]=='9' && data2[i+5]==':' && data2[i+6]==':' && data2[i+7]=='C' && data2[i+8]=='N' && data2[i+9]=='=')
                                {
                                    i += 9;
                                }
                                // Remove text ':CN=ca.org1.example.com'
                                if(data2[i+1]==':' && data2[i+2]=='C' && data2[i+3]=='N' && data2[i+4]=='=' && data2[i+5]=='c' && data2[i+6]=='a' && data2[i+7]=='.' && data2[i+8]=='o' && data2[i+9]=='r' && data2[i+10]=='g' && data2[i+11]=='1' && data2[i+12]=='.' && data2[i+13]=='e' && data2[i+14]=='x' && data2[i+15]=='a' && data2[i+16]=='m' && data2[i+17]=='p' && data2[i+18]=='l' && data2[i+19]=='e' && data2[i+20]=='.' && data2[i+21]=='c' && data2[i+22]=='o' && data2[i+23]=='m')
                                {
                                i += 24;
                                }
                                // Remove O=org1.example.com    
                                if(data2[i+1]=='O' && data2[i+2]=='=' && data2[i+3]=='o' && data2[i+4]=='r' && data2[i+5]=='g' && data2[i+6]=='1' && data2[i+7]=='.' && data2[i+8]=='e' && data2[i+9]=='x' && data2[i+10]=='a' && data2[i+11]=='m' && data2[i+12]=='p' && data2[i+13]=='l' && data2[i+14]=='e' && data2[i+15]=='.' && data2[i+16]=='c' && data2[i+17]=='o' && data2[i+18]=='m')
                                {
                                i += 18;
                                }

                                j = i + 1;
                                while(data2[j] != ',')
                                {
                                    if(j==data2.length-1)
                                    {
                                        string += data2[j];
                                        break;
                                    }
                                    string += data2[j];
                                    j++;
                                }
                                if (string != '') {
                                    values.push(string);
                                }                            
                                i = --j;
                                //console.log(string);
                            }
                        }
                        // console.log(label); 
                        // console.log(values); 

                        res.render('search_result',{
                            label: label,
                            values:values
                        });
                    } finally {
                        // Disconnect from the gateway when the application is closing
                        // This will close all connections to the network
                        gateway.disconnect();
                    }
                } catch (error) {
                    console.error(`******** FAILED to run the application: ${error}`);
                    res.render('search_form',{
                        errors:"Asset " + req.body.id + " does not exist"
                    })
                }
            } catch (error) {
                console.error(`******** FAILED to run the application: ${error}`);
            }
        }
        main();
    }
})

router.get('/update_owner_form', function(req,res){
    res.render('update_owner_form',{
        errors:{},
        success:{}
    })
})
router.post('/update_owner', function(req,res){
    var errors=[];
    if(!req.body.id){
        errors.push("Asset ID must be provided");
    }
    if(!req.body.newowner){
        errors.push("New owner name must be provided");
    }
    if(errors.length > 0){
        res.render('update_owner_form',{
            errors:errors,
            success:{}
        })
    }
    else
    {
        'use strict';

        const { Gateway, Wallets } = require('fabric-network');
        const FabricCAServices = require('fabric-ca-client');
        const path = require('path');
        const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
        const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
        
        const channelName = 'mychannel';
        const chaincodeName = 'basic';
        const mspOrg1 = 'Org1MSP';
        const walletPath = path.join(__dirname, 'wallet');
        const org1UserId = req.session.userid;
       
        async function main() {
            try {
                if(org1UserId === undefined){
                    res.render('login_form',{
                        errors:"Please log in to update owner.",
                        success:{}
                    })
                    return;
                }
                try {
                    const ccp = buildCCPOrg1();
                    const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
                    const wallet = await buildWallet(Wallets, walletPath);
                    const gateway = new Gateway();

                    // check existence of new owner
                    const userIdentity = await wallet.get(req.body.newowner);
                    if (!userIdentity) {
                        console.log(`An identity for the user ${req.body.newowner} does not exist in the wallet`);
                        res.render('update_owner_form',{
                            errors:"An identity for the user " + req.body.newowner + " does not exist in the wallet",
                            success:{}
                        })
                        return;
                    }

                    await gateway.connect(ccp, {
                        wallet,
                        identity: org1UserId,
                        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
                    });

                    const network = await gateway.getNetwork(channelName);
                    const contract = network.getContract(chaincodeName);

                    // Check asset owner
                    const assetOwner = await contract.evaluateTransaction('checkOwner', req.body.id);
                    if (assetOwner != org1UserId) {
                        res.render('update_owner_form',{
                            errors:"You do not own the asset",
                            success:{}
                        })
                        return;
                    }

                    try {
                        await contract.submitTransaction('TransferAsset', req.body.id, req.body.newowner);
                        console.log('*** Result: committed');
                    } finally {
                        // Disconnect from the gateway when the application is closing
                        // This will close all connections to the network
                        gateway.disconnect();
                        res.render('update_owner_form',{
                            errors:{},
                            success:"New owner updated successfully!"
                        })
                    }
                } catch (error) {
                    console.error(`******** FAILED to run the application: ${error}`);
                    res.render('update_owner_form',{
                        errors:"Error occured while transferring asset",
                        success:{}
                    })
                }
            } catch (error) {
                console.error(`******** FAILED to run the application: ${error}`);
            }
        }
        main();
    }
})

router.get('/register_user_form', function(req,res){
    res.render('register_user_form',{
        errors:{},
        success:{}
    })
})
router.post('/register_user', function(req,res){
    var errors=[];
    if(!req.body.userId){
        errors.push("User id must be provided");
    }
    if(!req.body.role){
        errors.push("A role must be selected for the new user");
    }
    if(errors.length > 0){
        res.render('register_user_form',{
            errors:errors,
            success:{}
        })
    }
    else
    {
        'use strict';

        const { Gateway, Wallets } = require('fabric-network');
        const FabricCAServices = require('fabric-ca-client');
        const path = require('path');
        const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
        const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
        
        const channelName = 'mychannel';
        const chaincodeName = 'basic';
        const mspOrg1 = 'Org1MSP';
        const walletPath = path.join(__dirname, 'wallet');
        const org1UserId = req.body.userId;
        
        function prettyJSONString(inputString) {
            return JSON.stringify(JSON.parse(inputString), null, 2);
        }
        
        async function main() {
            try {
                const ccp = buildCCPOrg1();
                const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
                const wallet = await buildWallet(Wallets, walletPath);
                const userIdentity = await wallet.get(org1UserId);
                if (userIdentity) {
                    console.log(`An identity for the user ${org1UserId} already exists in the wallet`);
                }
                await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1', req.body.role);
            } catch (error) {
                console.error(`******** FAILED to run the application: ${error}`);
            }
        }
        main();
        res.render('register_user_form',{
            errors:{},
            success:"New user added successfully!"
        })
    }
})

router.get('/asset_history_form', function(req,res){
    res.render('asset_history_form',{
        errors:{}
    })
})

router.post('/history',function(req,res){
    var errors=[];
    if(!req.body.id){
        errors.push("Asset ID must be provided");
    }
    if(errors.length > 0){
        res.render('asset_history_form',{
            errors:errors
        })
    }
    else
    {
        'use strict';
        const { Gateway, Wallets } = require('fabric-network');
        const FabricCAServices = require('fabric-ca-client');
        const path = require('path');
        const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
        const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

        const channelName = 'mychannel';
        const chaincodeName = 'basic';
        const mspOrg1 = 'Org1MSP';
        const walletPath = path.join(__dirname, 'wallet');
        const org1UserId = req.session.userid;

        function prettyJSONString(inputString) {
            return JSON.stringify(JSON.parse(inputString), null, 2);
        }

        async function main() {
            try {
                if(org1UserId === undefined){
                    res.render('login_form',{
                        errors:"Please log in to see history of an asset."
                    })
                    return;
                }

                // build an in memory object with the network configuration (also known as a connection profile)
                const ccp = buildCCPOrg1();

                // build an instance of the fabric ca services client based on
                // the information in the network configuration
                const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

                // setup the wallet to hold the credentials of the application user
                const wallet = await buildWallet(Wallets, walletPath);

                // in a real application this would be done on an administrative flow, and only once
                await enrollAdmin(caClient, wallet, mspOrg1);

                // in a real application this would be done only when a new user was required to be added
                // and would be part of an administrative flow
                await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

                // Create a new gateway instance for interacting with the fabric network.
                // In a real application this would be done as the backend server session is setup for
                // a user that has been verified.
                const gateway = new Gateway();

                try {
                    // setup the gateway instance
                    // The user will now be able to create connections to the fabric network and be able to
                    // submit transactions and query. All transactions submitted by this gateway will be
                    // signed by this user using the credentials stored in the wallet.
                    await gateway.connect(ccp, {
                        wallet,
                        identity: org1UserId,
                        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
                    });

                    // Build a network instance based on the channel where the smart contract is deployed
                    const network = await gateway.getNetwork(channelName);

                    // Get the contract from the network.
                    const contract = network.getContract(chaincodeName);

                    // Let's try a query type operation (function).
                    // This will be sent to just one peer and the results will be shown.
                    console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
                    let result = await contract.evaluateTransaction('GetAssetHistory', req.body.id);
                    console.log(`*** Result: ${prettyJSONString(result.toString())}`);

                    var data=result.toString();
                    console.log(data);                
                    var data2=[];
                    var label=[];
                    var values=[];
                    // remove {} [] ""
                    for(var i=0;i<data.length;i++)
                    {
                        if(data[i]!='{' && data[i]!='}' && data[i]!='{' && data[i]!='"' && data[i]!='[' && data[i]!=']')
                        {
                            data2.push(data[i]);
                            //console.log(data[i]); // removes {} [] ""
                        }
                    }

                    // Get Labels
                    var string;
                    var j;
                    for (var i=0; i < data2.length; i++)
                    {
                        string="";
                        if (i==0 || data2[i]==',')
                        {
                            // Eliminite the word 'Record'
                            if(data2[i+1]=='R' && data2[i+2]=='e' && data2[i+3]=='c' && data2[i+4]=='o' && data2[i+5]=='r' && data2[i+6]=='d') 
                            {
                                i+=7;
                            }
                            if (i==0)
                            {
                                j=i;
                            }
                            else
                            {
                                j=i+1;
                            }
                            while(data2[j] != ':')
                            {
                                string += data2[j];
                                j++;
                            }
                            label.push(string);
                            i = --j;
                            //console.log(string);
                        }
                    }
                    // Get Values 
                    for(var i=0; i < data2.length; i++)
                    {
                        string="";
                        if(data2[i]==':')
                        {
                           j = i + 1;
                            while(data2[j] != ',')
                            {
                                if(j==data2.length-1)
                                {
                                    string += data2[j];
                                    break;
                                }
                                string += data2[j];
                                j++;
                            }
                            if (string != '') {
                                values.push(string);
                            }
                            i = --j;
                            //console.log(string);
                        }
                    }
                    res.render('history',{
                        label: label,
                        values:values
                    });

                } finally {
                    // Disconnect from the gateway when the application is closing
                    // This will close all connections to the network
                    gateway.disconnect();
                }
            } catch (error) {
                console.error(`******** FAILED to run the application: ${error}`);
            }
        }    
    	main();
    }    
})

router.get('/login_form', function(req,res){
    session=req.session;
    res.render('login_form',{
        errors:{}
    })
})
router.post('/login_form', function(req,res){
    var errors=[];
    if(!req.body.userId){
        errors.push("User id must be provided");
    }
    if(!req.body.pw){
        errors.push("Password must be provided");
    }
    if(errors.length > 0){
        res.render('login_form',{
            errors:errors
        })
    }
    else
    {
        // a variable to save a session
        var session;
        session=req.session;
        session.userid=req.body.userId;
        console.log(req.session);

        'use strict';

        const { Gateway, Wallets } = require('fabric-network');
        const FabricCAServices = require('fabric-ca-client');
        const path = require('path');
        const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
        const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
        
        const channelName = 'mychannel';
        const chaincodeName = 'basic';
        const mspOrg1 = 'Org1MSP';
        const walletPath = path.join(__dirname, 'wallet');
        const org1UserId = req.body.userId;
        
        function prettyJSONString(inputString) {
            return JSON.stringify(JSON.parse(inputString), null, 2);
        }

        async function main() {
            try {
                // build an in memory object with the network configuration (also known as a connection profile)
                const ccp = buildCCPOrg1();

                // build an instance of the fabric ca services client based on
                // the information in the network configuration
                const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

                // setup the wallet to hold the credentials of the application user
                const wallet = await buildWallet(Wallets, walletPath);

                // in a real application this would be done on an administrative flow, and only once
                await enrollAdmin(caClient, wallet, mspOrg1);
    
                // in a real application this would be done only when a new user was required to be added
                // and would be part of an administrative flow
                //await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
    
                // Create a new gateway instance for interacting with the fabric network.
                // In a real application this would be done as the backend server session is setup for
                // a user that has been verified.
                const gateway = new Gateway();

                try {
                    const userIdentity = await wallet.get(org1UserId);
                    if (!userIdentity) {
                        console.log(`An identity for the user ${org1UserId} does not exist in the wallet`);
                        res.render('login_form',{
                            errors:"An identity for the user " + org1UserId + " does not exist in the wallet"
                        })
                        return;
                    }
                    // Take hash between -----PRIVATE KEY----- and ---END PRIVATE KEY--- 
                    // Press ctrl+f and remove \r\n from the hash and use it as password
                    if (userIdentity && userIdentity.type === 'X.509') {
                        const pk1 = userIdentity.credentials.privateKey.substr(27,66);
                        const pk2 = userIdentity.credentials.privateKey.substr(95,64);
                        const pk3 = userIdentity.credentials.privateKey.substr(161,56);
                        const privateKey = pk1.trim() + pk2.trim() + pk3.trim();
                        if (req.body.pw != privateKey) {
                            res.render('login_form',{
                                errors:"You have provided an invalid password"
                            })
                            return;
                        }    
                    }
                    // setup the gateway instance
                    // The user will now be able to create connections to the fabric network and be able to
                    // submit transactions and query. All transactions submitted by this gateway will be
                    // signed by this user using the credentials stored in the wallet.
                    await gateway.connect(ccp, {
                        wallet,
                        identity: org1UserId,
                        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
                    });
    
                    // Build a network instance based on the channel where the smart contract is deployed
                    const network = await gateway.getNetwork(channelName);

                    // Get the contract from the network.
                    const contract = network.getContract(chaincodeName);

                    // Initialize a set of asset data on the channel using the chaincode 'InitLedger' function.
                    // This type of transaction would only be run once by an application the first time it was started after it
                    // is deployed the first time. Any updates to the chaincode deployed later would likely not need to run
                    // an "init" type function.
                    // Comment out this line after first execution and restart server. 
                    let assetsExist = await contract.evaluateTransaction('AssetExists','asset1');
                    // add initial assets only when they do not exist
                    if (assetsExist == 'false') {
                        await contract.submitTransaction('InitLedger'); 
                        console.log('*** Result: committed');
                    }
                    // Let's try a query type operation (function).
                    // This will be sent to just one peer and the results will be shown.
                    console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
                    let result = await contract.evaluateTransaction('GetAllAssets');
                    console.log(`*** Result: ${prettyJSONString(result.toString())}`);
    
                    var data=result.toString();
                    var data2=[];
                    var label=[];
                    var values=[];
                    // remove {} [] ""
                    for(var i=0;i<data.length;i++)
                    {
                        if(data[i]!='{' && data[i]!='}' && data[i]!='{' && data[i]!='"' && data[i]!='[' && data[i]!=']')
                        {
                            data2.push(data[i]);
                        }
                    }
                    // Get Labels (Key, make, model, colour, owner)
                    var string;
                    var j;
                    for (var i=0; i < data2.length; i++)
                    {
                        string="";
                        if (i==0 || data2[i]==',')
                        {
                            // Eliminite the word 'Record'
                            if(data2[i+1]=='R' && data2[i+2]=='e' && data2[i+3]=='c' && data2[i+4]=='o' && data2[i+5]=='r' && data2[i+6]=='d') 
                            {
                                i+=7;
                            }
                            if (i==0)
                            {
                                j=i;
                            }
                            else
                            {
                                j=i+1;
                            }
                            while(data2[j] != ':')
                            {
                                string += data2[j];
                                j++;
                            }
                            label.push(string);
                            i = --j;
                        }
                    }
                    // Get Values (CAR0, Toyota, Prius, blue, Tomoko)
                    for(var i=0; i < data2.length; i++)
                    {
                        string="";
                        if(data2[i]==':')
                        {
                            j = i + 1;
                            while(data2[j] != ',')
                            {
                                if(j==data2.length-1)
                                {
                                    string += data2[j];
                                    break;
                                }
                                string += data2[j];
                                j++;
                            }
                            if (string != '') {
                                values.push(string);
                            }
                            i = --j;
                        }
                    }
                    // Call display.ejs from the view folder to display all assets
                    res.render('display',{
                        label: label,
                        values:values
                    });
    
                } finally {
                    // Disconnect from the gateway when the application is closing
                    // This will close all connections to the network
                    gateway.disconnect();
                }
            } catch (error) {
                console.error(`******** FAILED to run the application: ${error}`);
            }
        }        
        main();
    }
})

router.get('/logout', function(req,res){
    req.session.destroy();
    // Unset userid otherwise data can be view via URL like this: http://localhost:3001/display
    session.userid=undefined; 
    res.redirect('/');
})

// to use this router we export these routers from this file and then import that into app.js
// using --- const routes=require('./routes');  -- see line 110 in app.js file
module.exports=router
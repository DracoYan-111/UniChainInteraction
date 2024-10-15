import { Wallet, utils, ethers, BigNumber } from "ethers-v5";

import fs from "fs";


async function main() {
    // 测试网络
    //const provider = ethers.getDefaultProvider("127.0.0.1:8545");

    // 正式网络
    const provider = ethers.getDefaultProvider("https://sepolia.unichain.org");
    const fileContent = fs.readFileSync("./Mnemonic.json", "utf-8");
    const json = JSON.parse(fileContent);

    for (let i = 6; i < 5000; ++i) {
        // 获取第一个账户地址
        const walletsOne = Wallet.fromMnemonic(json.mnemonic, `m/44'/60'/0'/0/${i}`)
        // 获取第二个账户地址以转移gas
        const walletsTwo = Wallet.fromMnemonic(json.mnemonic, `m/44'/60'/0'/0/${i + 1}`)

        // 生成钱包实例
        const wallet = new ethers.Wallet(walletsOne.privateKey, provider);
        console.log("出现错误修改i为============>",i);
        
        // ===============   转账失败注释该处代码  ===============
        // 部署合约
        const factory = new ethers.ContractFactory([], "0x600a600c600039600a6000f3602a60005260206000f3", wallet);
        const contract = await factory.deploy();
        console.log("合约部署交易已发送。等待确认……");

        // 获取交易哈希
        console.log("合约部署 哈希:", contract.deployTransaction.hash);

        // 等待交易确认
        const receipt = await contract.deployTransaction.wait();
        console.log("区块中已确认的交易,合约地址:", receipt.contractAddress);

        console.log("等待余额更新确保精确...");
         // 暂停3秒，等待交易确定确保获取到最准确的余额
        await new Promise(resolve => setTimeout(resolve, 3000));

        // ===============   ===============  ===============

        console.log("开始转账...");
        // 获取钱包剩余余额
        let balance = await provider.getBalance(wallet.address);
        let transactionFee = 380000000000n // 可调整
        let gasPrcie = 1100000n // 可调整
        let gasLimit = 21000n; // 可调整
        let gasFee = BigNumber.from(gasPrcie * gasLimit + transactionFee);
        let balanceOnly = balance - gasFee

        console.log("Gas fee", gasFee.toString());
        console.log("Transfer balance", balanceOnly.toString());

        // 转移balance
        let tx = await wallet.sendTransaction({
            to: walletsTwo.address,
            value: balanceOnly.toString(),
            gasPrice: gasPrcie.toString(),
            gasLimit: gasLimit.toString(),
            nonce: await provider.getTransactionCount(walletsOne.address),
        });

        // 暂停3秒，等待交易确定
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 等待交易确认
        console.log("转账hash",await provider.waitForTransaction(tx.hash).transactionHash);

        // 检查上一个地址余额
        console.log("当前钱包剩余:",(await provider.getBalance(wallet.address)).toString());
        console.log(i,"用户操作完成");
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
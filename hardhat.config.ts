import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'dotenv/config'

const accounts = process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : []

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    hardhat: {},
    xlayer_testnet: {
      url: process.env.RPC_URL ?? 'https://testrpc.xlayer.tech',
      chainId: 1952,
      accounts,
    },
  },
}

export default config

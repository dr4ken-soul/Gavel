import { expect } from 'chai'
import { ethers } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-network-helpers'

const rubric = Buffer.from(JSON.stringify(['one', 'two', 'three']))
const salt = ethers.keccak256(ethers.toUtf8Bytes('test-salt'))
const specHash = ethers.keccak256(ethers.toUtf8Bytes('spec'))
const artifactHash = ethers.keccak256(ethers.toUtf8Bytes('artifact'))

function commitment(): string {
  return ethers.keccak256(ethers.solidityPacked(['bytes32', 'bytes32'], [ethers.keccak256(rubric), salt]))
}

async function signature(contract: { RULING_DOMAIN(): Promise<string> }, signer: { signMessage(data: Uint8Array): Promise<string> }, jobId: number, approve: boolean): Promise<string> {
  const domain = await contract.RULING_DOMAIN()
  const payload = ethers.keccak256(ethers.solidityPacked(['bytes32', 'bytes32', 'bytes32', 'uint8'], [domain, ethers.zeroPadValue(ethers.toBeHex(jobId), 32), artifactHash, approve ? 1 : 0]))
  return signer.signMessage(ethers.getBytes(payload))
}

describe('GavelEscrow', function () {
  async function fixture() {
    const [buyer, seller, judge, stranger] = await ethers.getSigners()
    const factory = await ethers.getContractFactory('GavelEscrow')
    const contract = await factory.deploy(judge.address)
    await contract.waitForDeployment()
    return { contract, buyer, seller, judge, stranger }
  }

  async function delivered() {
    const context = await fixture()
    const { contract, buyer, seller } = context
    await contract.connect(buyer).createJob(specHash, commitment(), 100, 100, { value: ethers.parseEther('0.5') })
    await contract.connect(seller).accept(1)
    await contract.connect(seller).deliver(1, artifactHash, 'ipfs://artifact')
    return context
  }

  it('pays the seller on an approved ruling', async function () {
    const { contract, buyer, seller, judge } = await delivered()
    const before = await ethers.provider.getBalance(seller.address)
    const sig = await signature(contract, judge, 1, true)
    const split = ethers.Signature.from(sig)
    await contract.connect(judge).rule(1, rubric, salt, true, split.v, split.r, split.s)
    expect((await contract.getJob(1)).status).to.equal(3)
    expect(await ethers.provider.getBalance(seller.address)).to.equal(before + ethers.parseEther('0.5'))
    expect((await ethers.provider.getBalance(buyer.address)) < ethers.parseEther('10000')).to.equal(true)
  })

  it('refunds the buyer on a rejected ruling', async function () {
    const { contract, buyer, judge } = await delivered()
    const before = await ethers.provider.getBalance(buyer.address)
    const sig = await signature(contract, judge, 1, false)
    const split = ethers.Signature.from(sig)
    const tx = await contract.rule(1, rubric, salt, false, split.v, split.r, split.s)
    await tx.wait()
    expect((await contract.getJob(1)).status).to.equal(4)
    expect(await ethers.provider.getBalance(buyer.address)).to.be.greaterThan(before)
  })

  it('rejects a tampered rubric', async function () {
    const { contract, judge } = await delivered()
    const sig = await signature(contract, judge, 1, true)
    const split = ethers.Signature.from(sig)
    await expect(contract.rule(1, Buffer.from('tampered'), salt, true, split.v, split.r, split.s)).to.be.revertedWith('rubric mismatch')
  })

  it('rejects a signature from the wrong judge', async function () {
    const { contract, stranger } = await delivered()
    const sig = await signature(contract, stranger, 1, true)
    const split = ethers.Signature.from(sig)
    await expect(contract.rule(1, rubric, salt, true, split.v, split.r, split.s)).to.be.revertedWith('not the judge')
  })

  it('rejects delivery after the deadline', async function () {
    const { contract, seller } = await fixture()
    const buyer = (await ethers.getSigners())[0]
    await contract.connect(buyer).createJob(specHash, commitment(), 10, 100, { value: ethers.parseEther('0.5') })
    await contract.connect(seller).accept(1)
    await time.increase(11)
    await expect(contract.connect(seller).deliver(1, artifactHash, 'ipfs://late')).to.be.revertedWith('late')
  })

  it('lets the buyer reclaim after either timeout', async function () {
    const first = await fixture()
    await first.contract.connect(first.buyer).createJob(specHash, commitment(), 10, 10, { value: ethers.parseEther('0.1') })
    await time.increase(11)
    await expect(first.contract.connect(first.buyer).reclaim(1)).not.to.be.reverted
    expect((await first.contract.getJob(1)).status).to.equal(4)

    const second = await delivered()
    await time.increase(101)
    await expect(second.contract.connect(second.buyer).reclaim(1)).not.to.be.reverted
    expect((await second.contract.getJob(1)).status).to.equal(4)
  })
})

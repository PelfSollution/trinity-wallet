/* global Electron */
import { ACC_MAIN, sha256, encrypt, decrypt } from 'libs/crypto';
import { byteToTrit } from 'libs/helpers';
import { prepareTransfersAsync } from 'libs/iota/extendedApi';

// Prefix for seed account titles stored in Keychain
const ACC_PREFIX = 'account';

class Keychain {
    /**
     * Init the vault
     * @param {array} key - Account decryption key
     * @param {string} accountId - Account identifier
     */
    constructor(key, accountId) {
        return (async () => {
            this.key = key.slice(0);
            if (accountId) {
                this.accountId = await sha256(`${ACC_PREFIX}-${accountId}`);
            }
            return this;
        })();
    }

    /**
     * Create new account
     * @param {string} accountId - Account identifier
     * @param {array} seed - Byte array seed
     * @returns {promise} - Resolves to a success boolean
     */
    addAccount = async (accountId, seed) => {
        this.accountId = await sha256(`${ACC_PREFIX}-${accountId}`);

        const vault = await encrypt(seed, this.key);
        await Electron.setKeychain(this.accountId, vault);

        return true;
    };

    /**
     * Remove account
     */
    removeAccount = async () => {
        if (!this.accountId) {
            throw new Error('Account not selected');
        }

        const isRemoved = await Electron.removeKeychain(this.accountId);

        if (!isRemoved) {
            throw new Error('Incorrect seed name');
        }

        return true;
    };

    /**
     * Rename account
     * @param {string} accountName - New account name
     * @returns {boolean} Seed renamed success state
     */
    renameAccount = async (accountName) => {
        const newID = await sha256(`${ACC_PREFIX}-${accountName}`);

        const vault = await Electron.readKeychain(this.accountId);

        if (!vault) {
            throw new Error('Incorrect seed name');
        }

        await decrypt(vault, this.key);

        await Electron.removeKeychain(this.accountId);
        await Electron.setKeychain(newID, vault);

        this.accountId = newID;

        return true;
    };

    /**
     * Update vault password
     * @param {array} key - Current encryption key
     * @param {array} keyNew - New encryption key
     * @returns {boolean} Password updated success state
     */
    static updatePassword = async (key, keyNew) => {
        const vault = await Electron.listKeychain();

        if (!vault) {
            throw new Error('Local storage not available');
        }

        const accounts = Object.keys(vault);

        if (!accounts.length) {
            return true;
        }

        for (let i = 0; i < accounts.length; i++) {
            const account = vault[i];

            if (account.account === `${ACC_MAIN}-salt`) {
                continue;
            }

            const decryptedVault = await decrypt(account.password, key);
            const encryptedVault = await encrypt(decryptedVault, keyNew);

            await Electron.setKeychain(account.account, encryptedVault);
        }

        return true;
    };

    /**
     * Generate address
     * @param {object} options - Address generation options
     *   @property {number} index - Address index
     *   @property {number} security - Address generation security level - 1,2 or 3
     *   @property {number} total - Address count to return
     * @returns {promise}
     */
    generateAddress = async (options) => {
        const seed = await this.getSeed(true);
        const addresses = await Electron.genFn(seed, options.index, options.security, options.total);

        for (let i = 0; i < seed.length * 3; i++) {
            seed[i % seed.length] = 0;
        }

        return addresses;
    };

    /**
     * Prepare transfers
     */
    prepareTransfers = async (transfers, options = null) => {
        const seed = await this.getSeed(true);
        return prepareTransfersAsync()(seed, transfers, options);
    };

    /**
     * Get seed from keychain
     * @param {boolean} rawTrits - Should return raw trits
     * @returns {array} Decrypted seed
     */
    getSeed = async (rawTrits) => {
        const vault = await Electron.readKeychain(this.accountId);

        if (!vault) {
            throw new Error('Incorrect seed name');
        }

        const decryptedVault = await decrypt(vault, this.key);
        if (rawTrits) {
            let trits = [];
            for (let i = 0; i < decryptedVault.length; i++) {
                trits = trits.concat(byteToTrit(decryptedVault[i]));
            }
            return trits;
        }
        return decryptedVault;
    };

    /**
     * Destroy the vault
     */
    destroy = () => {
        for (let i = 0; i < this.key.length * 3; i++) {
            this.key[i % this.key.length] = 0;
        }
        delete this.key;
    };
}

export default Keychain;

import { expect } from 'chai';
import {
    getAccountsFromState,
    getAccountInfoFromState,
    getUnconfirmedBundleTailsFromState,
    selectedAccountStateFactory,
    selectFirstAddressFromAccountFactory,
    getAccountNamesFromState,
    getSeedIndexFromState,
    selectAccountInfo,
    getTransfersForSelectedAccount,
    getAddressesForSelectedAccount,
    getBalanceForSelectedAccount,
    getSelectedAccountName,
    getSetupInfoFromAccounts,
    getTasksFromAccounts,
    getSetupInfoForSelectedAccount,
    getTasksForSelectedAccount,
    shouldTransitionForSnapshot,
    hasDisplayedSnapshotTransitionGuide,
    getFailedBundleHashesFromAccounts,
    getFailedBundleHashesForSelectedAccount,
    getNodesFromState,
    getSelectedNodeFromState,
} from '../../selectors/accounts';
import { defaultNode as DEFAULT_NODE } from '../../config';

describe('selectors: accounts', () => {
    describe('#getAccountsFromState', () => {
        describe('when "accounts" prop is not defined in argument', () => {
            it('should return an empty object', () => {
                expect(getAccountsFromState({ foo: {} })).to.eql({});
            });
        });

        describe('when "accounts" prop is defined in argument', () => {
            it('should return value for "accounts" prop', () => {
                expect(getAccountsFromState({ foo: {}, accounts: { baz: {} } })).to.eql({ baz: {} });
            });
        });
    });

    describe('#getAccountInfoFromState', () => {
        describe('when "accountInfo" prop is not defined as a nested prop under "accounts" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getAccountInfoFromState({ accounts: { notAccountInfo: {} } })).to.eql({});
            });
        });

        describe('when "accountInfo" prop is defined as a nested prop under "accounts" prop in argument', () => {
            it('should return value for "accounts" prop', () => {
                expect(getAccountInfoFromState({ accounts: { accountInfo: { foo: {} } } })).to.eql({ foo: {} });
            });
        });
    });

    describe('#getUnconfirmedBundleTailsFromState', () => {
        describe('when "unconfirmedBundleTails" prop is not defined as a nested prop under "accounts" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getUnconfirmedBundleTailsFromState({ accounts: { foo: {} } })).to.eql({});
            });
        });

        describe('when "unconfirmedBundleTails" prop is defined as a nested prop under "accounts" prop in argument', () => {
            it('should return value for "unconfirmedBundleTails" prop', () => {
                expect(
                    getUnconfirmedBundleTailsFromState({ accounts: { unconfirmedBundleTails: { foo: {} } } }),
                ).to.eql({ foo: {} });
            });
        });
    });

    describe('#selectedAccountStateFactory', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts: {
                    unconfirmedBundleTails: { foo: {} },
                    accountInfo: {
                        valid: {
                            transfers: {},
                            addresses: {},
                            balance: 0,
                            hashes: [],
                        },
                        invalid: {
                            transfers: {},
                            addresses: {},
                            balance: 0,
                            hashes: [],
                        },
                    },
                },
                garbage: {},
            };
        });

        it('should return an object with props "transfers", "addresses", "balance", "unconfirmedBundleTails" and "hashes"', () => {
            expect(selectedAccountStateFactory('valid')(state)).to.have.keys([
                'transfers',
                'addresses',
                'balance',
                'hashes',
                'unconfirmedBundleTails',
                'accountName',
            ]);
        });
    });

    describe('#selectFirstAddressFromAccountFactory', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts: {
                    unconfirmedBundleTails: {},
                    pendingTxHashesForSpentAddresses: {},
                    txHashesForUnspentAddresses: {},
                    accountInfo: {
                        foo: {
                            transfers: [],
                            addresses: {
                                ['U'.repeat(81)]: { index: 0, balance: 0, spent: false, checksum: 'NXELTUENX' },
                                ['A'.repeat(81)]: { index: 1, balance: 10, spent: false, checksum: 'YLFHUOJUY' },
                            },
                            balance: 10,
                        },
                        baz: {
                            transfers: {},
                            addresses: {
                                addresses: {
                                    ['B'.repeat(81)]: { index: 0, balance: 20, spent: false, checksum: 'IO9LGIBVB' },
                                },
                            },
                            balance: 20,
                        },
                    },
                },
                alerts: {},
            };
        });

        it('should return first address (index === 0) with checksum for selected account', () => {
            const firstAddressWithChecksum = `${'U'.repeat(81)}NXELTUENX`;
            expect(selectFirstAddressFromAccountFactory('foo')(state)).to.equal(firstAddressWithChecksum);
        });
    });

    describe('#getAccountNamesFromState', () => {
        describe('when "accountInfo" prop is not defined as a nested prop under "accounts" prop in argument', () => {
            it('should return an empty array', () => {
                expect(getAccountNamesFromState({ accounts: { notAccountInfo: [] } })).to.eql([]);
            });
        });

        describe('when "accountInfo" prop is defined as a nested prop under "accounts" prop in argument', () => {
            it('should return value for "accountNames" prop', () => {
                expect(getAccountNamesFromState({ accounts: { accountInfo: { a: {}, b: [] } } })).to.eql(['a', 'b']);
            });
        });
    });

    describe('#getSeedIndexFromState', () => {
        describe('when "seedIndex" prop is not defined as a nested prop under "wallet" prop in argument', () => {
            it('should return 0', () => {
                expect(getSeedIndexFromState({ wallet: { notSeedIndex: 4 } })).to.equal(0);
            });
        });

        describe('when "seedIndex" prop is defined as a nested prop under "wallet" prop in argument', () => {
            it('should return value for "seedIndex" prop', () => {
                expect(getSeedIndexFromState({ wallet: { seedIndex: 3 } })).to.equal(3);
            });
        });
    });

    describe('#selectAccountInfo', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts: {
                    accountInfo: {
                        foo: {
                            transfers: {},
                            addresses: {},
                            balance: 0,
                        },
                        baz: {
                            transfers: {},
                            addresses: {
                                addresses: {
                                    ['B'.repeat(81)]: { index: 0, balance: 20, spent: false },
                                },
                            },
                            balance: 20,
                        },
                    },
                },
                wallet: {
                    seedIndex: 0,
                },
            };
        });

        it('should slice accountInfo with currently selected account name', () => {
            expect(selectAccountInfo(state)).to.eql({
                transfers: {},
                addresses: {},
                balance: 0,
            });
        });
    });

    describe('#getTransfersForSelectedAccount', () => {
        describe('when "transfers" prop is not defined as a nested prop under selected account info object', () => {
            it('should return an empty object', () => {
                expect(
                    getTransfersForSelectedAccount({
                        accounts: {
                            accountInfo: {
                                foo: {
                                    addresses: {},
                                    balance: 0,
                                },
                                baz: {
                                    addresses: {},
                                    balance: 0,
                                },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql({});
            });
        });

        describe('when "transfers" prop is defined as a nested prop under selected account info object', () => {
            it('should return transfers', () => {
                expect(
                    getTransfersForSelectedAccount({
                        accounts: {
                            accountInfo: {
                                foo: {
                                    transfers: {
                                        bundleOne: { foo: {} },
                                        bundleTwo: { foo: {} },
                                    },
                                    addresses: {},
                                    balance: 0,
                                },
                                baz: {
                                    transfers: [],
                                    addresses: {},
                                    balance: 0,
                                },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql({
                    bundleOne: { foo: {} },
                    bundleTwo: { foo: {} },
                });
            });
        });
    });

    describe('#getAddressesForSelectedAccount', () => {
        describe('when "addresses" prop is not defined as a nested prop under selected account info object', () => {
            it('should return an empty array', () => {
                expect(
                    getAddressesForSelectedAccount({
                        accounts: {
                            accountInfo: {
                                foo: {
                                    transfers: {},
                                    balance: 0,
                                },
                                baz: {
                                    transfers: {},
                                    balance: 0,
                                },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql([]);
            });
        });

        describe('when "addresses" prop is defined as a nested prop under selected account info object', () => {
            it('should return list of addresses', () => {
                expect(
                    getAddressesForSelectedAccount({
                        accounts: {
                            accountInfo: {
                                foo: {
                                    transfers: {},
                                    addresses: {
                                        ['U'.repeat(81)]: {},
                                        ['A'.repeat(81)]: {},
                                    },
                                    balance: 0,
                                },
                                baz: {
                                    transfers: {},
                                    addresses: {},
                                    balance: 0,
                                },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql(['U'.repeat(81), 'A'.repeat(81)]);
            });
        });
    });

    describe('#getBalanceForSelectedAccount', () => {
        describe('when "balance" prop is not defined as a nested prop under selected account info object', () => {
            it('should return 0', () => {
                expect(
                    getBalanceForSelectedAccount({
                        accounts: {
                            accountInfo: {
                                foo: {
                                    transfers: {},
                                    addresses: {},
                                },
                                baz: {
                                    transfers: {},
                                    addresses: {},
                                },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(0);
            });
        });

        describe('when "balance" prop is defined as a nested prop under selected account info object', () => {
            it('should return balance', () => {
                expect(
                    getBalanceForSelectedAccount({
                        accounts: {
                            accountInfo: {
                                foo: {
                                    transfers: {},
                                    addresses: {},
                                    balance: 10000,
                                },
                                baz: {
                                    transfers: {},
                                    addresses: {},
                                    balance: 10,
                                },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(10000);
            });
        });
    });

    describe('#getSelectedAccountName', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts: {
                    accountInfo: {
                        foo: {},
                        baz: {},
                    },
                },
                wallet: {
                    seedIndex: 0,
                },
            };
        });

        it('should return account name for seed index', () => {
            expect(getSelectedAccountName(state)).to.equal('foo');
        });
    });

    describe('#getSetupInfoFromAccounts', () => {
        describe('when "setupInfo" prop is not defined as a nested prop under "accounts" reducer', () => {
            it('should return an empty object', () => {
                expect(getSetupInfoFromAccounts({ accounts: { foo: {} } })).to.eql({});
            });
        });

        describe('when "setupInfo" prop is defined as a nested prop under "accounts" reducer', () => {
            it('should return value for "setupInfo" prop', () => {
                expect(getSetupInfoFromAccounts({ accounts: { setupInfo: { foo: {} } } })).to.eql({ foo: {} });
            });
        });
    });

    describe('#getTasksFromAccounts', () => {
        describe('when "tasks" prop is not defined as a nested prop under "accounts" reducer', () => {
            it('should return an empty object', () => {
                expect(getTasksFromAccounts({ accounts: { foo: {} } })).to.eql({});
            });
        });

        describe('when "tasks" prop is defined as a nested prop under "accounts" reducer', () => {
            it('should return value for "tasks" prop', () => {
                expect(getTasksFromAccounts({ accounts: { tasks: { foo: {} } } })).to.eql({ foo: {} });
            });
        });
    });

    describe('#getSetupInfoForSelectedAccount', () => {
        describe('when account name is not defined as a nested prop under setupInfo object', () => {
            it('should return an empty object', () => {
                expect(
                    getSetupInfoForSelectedAccount({
                        accounts: {
                            accountInfo: {},
                            setupInfo: {
                                foo: { prop: true },
                            },
                        },
                        wallet: {
                            seedIndex: 1,
                        },
                    }),
                ).to.eql({});
            });
        });

        describe('when account name is defined as a nested prop under setupInfo object', () => {
            it('should return value for selected account', () => {
                expect(
                    getSetupInfoForSelectedAccount({
                        accounts: {
                            accountInfo: {
                                foo: {},
                            },
                            setupInfo: {
                                foo: { prop: true },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql({ prop: true });
            });
        });
    });

    describe('#getFailedBundleHashesFromAccounts', () => {
        describe('when "failedBundleHashes" prop is not defined as a nested prop under "accounts" reducer', () => {
            it('should return an empty object', () => {
                expect(getFailedBundleHashesFromAccounts({ accounts: { foo: {} } })).to.eql({});
            });
        });

        describe('when "failedBundleHashes" prop is defined as a nested prop under "accounts" reducer', () => {
            it('should return value for "failedBundleHashes" prop', () => {
                expect(
                    getFailedBundleHashesFromAccounts({ accounts: { failedBundleHashes: { foo: { AAA: [{}] } } } }),
                ).to.eql({ foo: { AAA: [{}] } });
            });
        });
    });

    describe('#getFailedBundleHashesForSelectedAccount', () => {
        describe('when account name is not defined as a nested prop under "failedBundleHashes" object', () => {
            it('should return an empty object', () => {
                expect(
                    getFailedBundleHashesForSelectedAccount({
                        accounts: {
                            accountInfo: {},
                            failedBundleHashes: {
                                foo: { AAA: [{}] },
                            },
                        },
                        wallet: {
                            seedIndex: 1,
                        },
                    }),
                ).to.eql({});
            });
        });

        describe('when account name is defined as a nested prop under "failedBundleHashes" object', () => {
            it('should return value for selected account', () => {
                expect(
                    getFailedBundleHashesForSelectedAccount({
                        accounts: {
                            accountInfo: {
                                foo: {},
                            },
                            failedBundleHashes: {
                                foo: {
                                    AAA: [{}, {}],
                                },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql({ AAA: [{}, {}] });
            });
        });
    });

    describe('#getTasksForSelectedAccount', () => {
        describe('when account name is not defined as a nested prop under tasks object', () => {
            it('should return an empty object', () => {
                expect(
                    getTasksForSelectedAccount({
                        accounts: {
                            accountInfo: {},
                            tasks: {
                                foo: { prop: true },
                            },
                        },
                        wallet: {
                            seedIndex: 1,
                        },
                    }),
                ).to.eql({});
            });
        });

        describe('when account name is defined as a nested prop under tasks object', () => {
            it('should return value for selected account', () => {
                expect(
                    getTasksForSelectedAccount({
                        accounts: {
                            accountInfo: {
                                foo: {},
                            },
                            tasks: {
                                foo: { prop: true },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql({ prop: true });
            });
        });
    });

    describe('#shouldTransitionForSnapshot', () => {
        describe('when "usedExistingSeed" prop under "setupInfo" is false and balance is 0', () => {
            it('should return false', () => {
                expect(
                    shouldTransitionForSnapshot({
                        accounts: {
                            accountInfo: {
                                foo: { balance: 0 },
                            },
                            setupInfo: {
                                foo: { usedExistingSeed: false },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(false);
            });
        });

        describe('when "usedExistingSeed" prop under "setupInfo" is true and balance is not 0', () => {
            it('should return false', () => {
                expect(
                    shouldTransitionForSnapshot({
                        accounts: {
                            accountInfo: {
                                foo: { balance: 1 },
                            },
                            setupInfo: {
                                foo: { usedExistingSeed: true },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(false);
            });
        });

        describe('when "usedExistingSeed" prop under "setupInfo" is true and balance is 0', () => {
            it('should return true', () => {
                expect(
                    shouldTransitionForSnapshot({
                        accounts: {
                            accountInfo: {
                                foo: { balance: 0 },
                            },
                            setupInfo: {
                                foo: { usedExistingSeed: true },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(true);
            });
        });
    });

    describe('#hasDisplayedSnapshotTransitionGuide', () => {
        describe('when "hasDisplayedTransitionGuide" prop under "tasks" is not defined', () => {
            it('should return true', () => {
                expect(
                    hasDisplayedSnapshotTransitionGuide({
                        accounts: {
                            accountInfo: {
                                foo: {},
                            },
                            tasks: {
                                foo: { unknownProp: false },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(true);
            });
        });

        describe('when "hasDisplayedTransitionGuide" prop under "tasks" is defined', () => {
            it('should return value of "hasDisplayedTransitionGuide"', () => {
                expect(
                    hasDisplayedSnapshotTransitionGuide({
                        accounts: {
                            accountInfo: {
                                foo: {},
                            },
                            tasks: {
                                // Set hasDisplayedTransitionGuide to string instead of boolean
                                // to check for false positives
                                foo: { hasDisplayedTransitionGuide: 'raw' },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal('raw');
            });
        });
    });

    describe('#getNodesFromState', () => {
        let state;

        beforeEach(() => {
            state = {
                settings: {
                    nodes: ['foo', 'baz'],
                },
            };
        });

        describe('when "nodes" prop is defined in settings reducer', () => {
            it('should return "nodes" prop', () => {
                expect(getNodesFromState(state)).to.eql(['foo', 'baz']);
            });
        });

        describe('when "nodes" prop is undefined in settings reducer', () => {
            it('should return an empty array', () => {
                expect(getNodesFromState({ settings: {} })).to.eql([]);
            });
        });
    });

    describe('#getSelectedNodeFromState', () => {
        let state;

        beforeEach(() => {
            state = {
                settings: {
                    node: 'foo',
                },
            };
        });

        describe('when "node" prop is defined in settings reducer', () => {
            it('should return "node" prop', () => {
                expect(getSelectedNodeFromState(state)).to.equal('foo');
            });
        });

        describe('when "nodes" prop is undefined in settings reducer', () => {
            it('should return wallet default node', () => {
                expect(getSelectedNodeFromState({ settings: {} })).to.equal(DEFAULT_NODE);
            });
        });
    });
});

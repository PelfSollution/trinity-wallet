/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import { MAX_SEED_LENGTH } from 'libs/iota/utils';
import SeedStore from 'libs/SeedStore';

import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';
import SeedInput from 'ui/components/input/Seed';

/**
 * Onboarding, Seed correct backup validation or existing seed input component
 */
class SeedVerify extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: [],
        isGenerated: Electron.getOnboardingGenerated(),
    };

    componentDidMount() {
        const { generateAlert, t } = this.props;

        if (Electron.getOnboardingSeed()) {
            Electron.garbageCollect();
        }

        generateAlert('info', t('seedReentry:clipboardWarning'), t('seedReentry:clipboardWarningExplanation'));
    }

    onChange = (value) => {
        this.setState(() => ({
            seed: value,
        }));
    };

    /**
     * Verify valid seed, set onboarding seed state
     * @param {event} event - Form submit event
     * @returns {Promise}
     */
    setSeed = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const { wallet, history, generateAlert, t } = this.props;
        const { seed, isGenerated } = this.state;

        if (
            isGenerated &&
            (seed.length !== Electron.getOnboardingSeed().length ||
                !Electron.getOnboardingSeed().every(
                    (v, i) => v[0] === seed[i][0] && v[1] === seed[i][1] && v[2] === seed[i][2],
                ))
        ) {
            generateAlert('error', t('seedReentry:incorrectSeed'), t('seedReentry:incorrectSeedExplanation'));
            return;
        }

        if (seed.length < MAX_SEED_LENGTH) {
            generateAlert(
                'error',
                t('enterSeed:seedTooShort'),
                t('enterSeed:seedTooShortExplanation', { maxLength: MAX_SEED_LENGTH, currentLength: seed.length }),
            );
            return;
        }

        if (!isGenerated) {
            Electron.setOnboardingSeed(seed, false);
            history.push('/onboarding/account-name');
        } else {
            if (wallet.ready) {
                const seedStore = await new SeedStore.keychain(wallet.password);
                await seedStore.addAccount(wallet.additionalAccountName, Electron.getOnboardingSeed());

                Electron.setOnboardingSeed(null);

                history.push('/onboarding/login');
            } else {
                history.push('/onboarding/account-password');
            }
        }
    };

    render() {
        const { t } = this.props;
        const { seed, isGenerated } = this.state;

        return (
            <form>
                <section>
                    <h1>{t('seedReentry:enterYourSeed')}</h1>
                    {isGenerated ? (
                        <p>{t('seedReentry:enterSeedBelow')}</p>
                    ) : (
                        <p>
                            {t('enterSeed:seedExplanation', { maxLength: MAX_SEED_LENGTH })}{' '}
                            <strong>{t('enterSeed:neverShare')}</strong>
                        </p>
                    )}
                    <SeedInput
                        seed={seed}
                        focus
                        updateImportName={!isGenerated}
                        onChange={this.onChange}
                        label={t('seed')}
                        closeLabel={t('back')}
                    />
                </section>
                <footer>
                    <Button to={`/onboarding/seed-${isGenerated ? 'save' : 'intro'}`} className="square" variant="dark">
                        {t('goBackStep')}
                    </Button>
                    <Button onClick={this.setSeed} className="square" variant="primary">
                        {t('continue')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    wallet: state.wallet,
});

const mapDispatchToProps = {
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(SeedVerify));

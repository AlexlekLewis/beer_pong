import { useState } from 'react';
import { useTournamentStore } from '../../lib/store';
import { formatPrice, getBuyBackPrice } from '../../lib/buyback';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function RoundPricing() {
    const { tournament, setRoundBuyBackPrice } = useTournamentStore();
    const [roundInput, setRoundInput] = useState(String(tournament?.currentRound ?? 1));
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    if (!tournament) return null;
    const round = Number(roundInput);
    const validRound = Number.isSafeInteger(round) && round >= tournament.currentRound;
    const locked = tournament.status === 'completed' || !validRound || (round === tournament.currentRound && Object.values(tournament.buyBackDecisions).some(Boolean));
    const price = validRound ? getBuyBackPrice(round, tournament.buyBackBasePrice, tournament.buyBackIncrement, tournament.buyBackRoundPrices) : null;
    return <section className="mt-6 pt-6 border-t border-[var(--border)] space-y-4" aria-labelledby="pricing-heading">
        <h4 id="pricing-heading" className="font-bold">Round buy-in / buy-back pricing</h4>
        <p className="text-sm text-[var(--text-muted)]">Set the team re-entry fee for any current or future round. The default is {formatPrice(tournament.buyBackBasePrice)} plus {formatPrice(tournament.buyBackIncrement)} per round. Prices lock after the first buy-back in that round.</p>
        <form className="space-y-3" onSubmit={event => {
            event.preventDefault();
            if (!amount.trim()) { setMessage('Enter an amount.'); return; }
            const error = setRoundBuyBackPrice(round, Number(amount));
            setMessage(error ?? `Round ${round} buy-back set to ${formatPrice(Number(amount))}.`);
            if (!error) setAmount('');
        }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Round to price" type="number" min={tournament.currentRound} step="1" required value={roundInput} onChange={event => { setRoundInput(event.target.value); setAmount(''); setMessage(''); }} />
                <Input label="Team re-entry amount ($)" type="number" min="0" step="0.01" required disabled={locked} value={amount} placeholder={price === null ? '' : String(price)} onChange={event => setAmount(event.target.value)} />
            </div>
            {price !== null && <p className="text-sm">Round {round} currently costs <strong>{formatPrice(price)}</strong> per team{tournament.buyBackRoundPrices?.[round] !== undefined ? ' (custom amount)' : ' (default schedule)'}.</p>}
            <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={locked}>Save round amount</Button>
                <Button type="button" variant="ghost" disabled={locked || tournament.buyBackRoundPrices?.[round] === undefined} onClick={() => {
                    const error = setRoundBuyBackPrice(round, null);
                    setMessage(error ?? `Round ${round} restored to the default price.`);
                    if (!error) setAmount('');
                }}>Use default</Button>
            </div>
            <p role="status" className="text-sm">{message}</p>
        </form>
        {Object.keys(tournament.buyBackRoundPrices ?? {}).length > 0 && <ul className="text-sm space-y-1" aria-label="Custom round amounts">
            {Object.entries(tournament.buyBackRoundPrices ?? {}).sort(([a], [b]) => Number(a) - Number(b)).map(([number, value]) => <li key={number}>Round {number}: {formatPrice(value)} per team</li>)}
        </ul>}
    </section>;
}

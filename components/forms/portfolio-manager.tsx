"use client";

import type { SavedPortfolio } from "@/lib/schemas/persistence";

type PortfolioManagerProps = {
  portfolios: SavedPortfolio[];
  selectedPortfolioId: string;
  portfolioName: string;
  pending: boolean;
  onSelectPortfolio: (id: string) => void;
  onSavePortfolio: () => void;
  onDeletePortfolio: () => void;
};

export function PortfolioManager({
  portfolios,
  selectedPortfolioId,
  portfolioName,
  pending,
  onSelectPortfolio,
  onSavePortfolio,
  onDeletePortfolio,
}: PortfolioManagerProps) {
  return (
    <section className="portfolio-manager">
      <div className="portfolio-manager__header">
        <div>
          <p className="eyebrow">Portfolio Manager</p>
          <h4>Load or save named books</h4>
        </div>
      </div>

      <div className="portfolio-manager__controls">
        <label className="field">
          <span className="field__label">Saved portfolios</span>
          <select
            className="field__input"
            value={selectedPortfolioId}
            onChange={(event) => onSelectPortfolio(event.target.value)}
            disabled={pending}
          >
            <option value="">Select a saved portfolio</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        </label>

        <div className="button-row">
          <button
            className="button button--secondary"
            type="button"
            disabled={pending || !portfolioName.trim()}
            onClick={onSavePortfolio}
          >
            Save Portfolio
          </button>
          <button
            className="button button--ghost"
            type="button"
            disabled={pending || !selectedPortfolioId}
            onClick={onDeletePortfolio}
          >
            Delete Selected
          </button>
        </div>
      </div>
    </section>
  );
}

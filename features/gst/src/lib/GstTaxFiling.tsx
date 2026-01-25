import { useState, useEffect, useCallback } from 'react';
import {
  gstApi,
  GstSummary,
  Gstr1Report,
  Gstr3bReport,
  GstReturn,
  GstReturnsListResponse,
  GstReturnType,
} from '@inventory-platform/api';
import styles from './gst.module.css';

type TabType = 'summary' | 'gstr1' | 'gstr3b' | 'returns';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatPeriodDisplay = (period: string): string => {
  const [year, month] = period.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return styles.statusDraft;
    case 'GENERATED':
      return styles.statusGenerated;
    case 'EXPORTED':
      return styles.statusExported;
    case 'FILED':
      return styles.statusFiled;
    case 'AMENDED':
      return styles.statusAmended;
    default:
      return styles.statusDraft;
  }
};

export function GstTaxFiling() {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<GstSummary | null>(null);
  const [gstr1, setGstr1] = useState<Gstr1Report | null>(null);
  const [gstr3b, setGstr3b] = useState<Gstr3bReport | null>(null);
  const [returns, setReturns] = useState<GstReturnsListResponse | null>(null);

  const [generating, setGenerating] = useState(false);
  const [filing, setFiling] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryData, gstr1Data, gstr3bData, returnsData] = await Promise.all([
        gstApi.getSummary(period),
        gstApi.getGstr1(period),
        gstApi.getGstr3b(period),
        gstApi.listReturns(),
      ]);

      setSummary(summaryData);
      setGstr1(gstr1Data);
      setGstr3b(gstr3bData);
      setReturns(returnsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GST data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateReturn = async (returnType: GstReturnType) => {
    setGenerating(true);
    setError(null);

    try {
      await gstApi.generateReturn(period, returnType);
      const returnsData = await gstApi.listReturns();
      setReturns(returnsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate return');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsFiled = async (returnId: string) => {
    setFiling(returnId);
    setError(null);

    try {
      await gstApi.markAsFiled(returnId);
      const returnsData = await gstApi.listReturns();
      setReturns(returnsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark return as filed');
    } finally {
      setFiling(null);
    }
  };

  const renderSummaryTab = () => {
    if (!summary) return null;

    return (
      <div className={styles.summarySection}>
        <div className={styles.shopInfo}>
          <div className={styles.shopInfoItem}>
            <span className={styles.shopInfoLabel}>Shop Name</span>
            <span className={styles.shopInfoValue}>{summary.shopName}</span>
          </div>
          <div className={styles.shopInfoItem}>
            <span className={styles.shopInfoLabel}>GSTIN</span>
            <span className={styles.shopInfoValue}>{summary.shopGstin}</span>
          </div>
          <div className={styles.shopInfoItem}>
            <span className={styles.shopInfoLabel}>Period</span>
            <span className={styles.shopInfoValue}>{formatPeriodDisplay(summary.period)}</span>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>📊 Tax Summary</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Taxable Value</div>
            <div className={`${styles.summaryValue} ${styles.summaryValueHighlight}`}>
              {formatCurrency(summary.totalTaxableValue)}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>CGST</div>
            <div className={styles.summaryValue}>{formatCurrency(summary.totalCgst)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>SGST</div>
            <div className={styles.summaryValue}>{formatCurrency(summary.totalSgst)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>IGST</div>
            <div className={styles.summaryValue}>{formatCurrency(summary.totalIgst)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Cess</div>
            <div className={styles.summaryValue}>{formatCurrency(summary.totalCess)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Tax Liability</div>
            <div className={`${styles.summaryValue} ${styles.summaryValueWarning}`}>
              {formatCurrency(summary.totalTaxLiability)}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Invoices</div>
            <div className={`${styles.summaryValue} ${styles.summaryValueSuccess}`}>
              {summary.totalInvoices}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📈 Rate-wise Tax Summary</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>GST Rate</th>
                    <th className={styles.textRight}>Taxable Value</th>
                    <th className={styles.textRight}>CGST</th>
                    <th className={styles.textRight}>SGST</th>
                    <th className={styles.textRight}>IGST</th>
                    <th className={styles.textRight}>Cess</th>
                    <th className={styles.textCenter}>Invoices</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.ratewiseSummary.map((item, index) => (
                    <tr key={index}>
                      <td>{item.rate}%</td>
                      <td className={styles.textRight}>{formatCurrency(item.taxableValue)}</td>
                      <td className={styles.textRight}>{formatCurrency(item.cgstAmount)}</td>
                      <td className={styles.textRight}>{formatCurrency(item.sgstAmount)}</td>
                      <td className={styles.textRight}>{formatCurrency(item.igstAmount)}</td>
                      <td className={styles.textRight}>{formatCurrency(item.cessAmount)}</td>
                      <td className={styles.textCenter}>{item.invoiceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📦 HSN-wise Summary</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>HSN Code</th>
                    <th>Description</th>
                    <th>UQC</th>
                    <th className={styles.textRight}>Quantity</th>
                    <th className={styles.textRight}>Total Value</th>
                    <th className={styles.textRight}>Taxable Value</th>
                    <th className={styles.textRight}>CGST</th>
                    <th className={styles.textRight}>SGST</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.hsnSummary.map((item, index) => (
                    <tr key={index}>
                      <td>{item.hsnCode}</td>
                      <td>{item.description}</td>
                      <td>{item.uqc}</td>
                      <td className={styles.textRight}>{item.totalQuantity}</td>
                      <td className={styles.textRight}>{formatCurrency(item.totalValue)}</td>
                      <td className={styles.textRight}>{formatCurrency(item.taxableValue)}</td>
                      <td className={styles.textRight}>
                        {formatCurrency(item.cgstAmount)} ({item.cgstRate}%)
                      </td>
                      <td className={styles.textRight}>
                        {formatCurrency(item.sgstAmount)} ({item.sgstRate}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGstr1Tab = () => {
    if (!gstr1) return null;

    return (
      <div className={styles.gstr3bSection}>
        <div className={styles.shopInfo}>
          <div className={styles.shopInfoItem}>
            <span className={styles.shopInfoLabel}>Legal Name</span>
            <span className={styles.shopInfoValue}>{gstr1.legalName}</span>
          </div>
          <div className={styles.shopInfoItem}>
            <span className={styles.shopInfoLabel}>GSTIN</span>
            <span className={styles.shopInfoValue}>{gstr1.gstin}</span>
          </div>
          <div className={styles.shopInfoItem}>
            <span className={styles.shopInfoLabel}>Return Period</span>
            <span className={styles.shopInfoValue}>{gstr1.period}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>🏢 B2B Invoices (Business to Business)</h3>
          </div>
          <div className={styles.cardBody}>
            {gstr1.b2bInvoices.length > 0 ? (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Invoice Date</th>
                      <th>Buyer GSTIN</th>
                      <th>Buyer Name</th>
                      <th className={styles.textRight}>Invoice Value</th>
                      <th className={styles.textCenter}>Place of Supply</th>
                      <th className={styles.textCenter}>Reverse Charge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstr1.b2bInvoices.map((invoice, index) => (
                      <tr key={index}>
                        <td>{invoice.invoiceNo}</td>
                        <td>{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</td>
                        <td>{invoice.buyerGstin}</td>
                        <td>{invoice.buyerName}</td>
                        <td className={styles.textRight}>{formatCurrency(invoice.invoiceValue)}</td>
                        <td className={styles.textCenter}>{invoice.placeOfSupply}</td>
                        <td className={styles.textCenter}>{invoice.reverseCharge ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📄</div>
                <div className={styles.emptyStateText}>No B2B invoices for this period</div>
              </div>
            )}
          </div>
        </div>

        {gstr1.b2csSummary && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>🛒 B2CS Summary (Business to Consumer - Small)</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Place of Supply</div>
                  <div className={styles.summaryValue}>{gstr1.b2csSummary.placeOfSupply}</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Rate</div>
                  <div className={styles.summaryValue}>{gstr1.b2csSummary.rate}%</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Taxable Value</div>
                  <div className={styles.summaryValue}>
                    {formatCurrency(gstr1.b2csSummary.taxableValue)}
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>CGST Amount</div>
                  <div className={styles.summaryValue}>
                    {formatCurrency(gstr1.b2csSummary.cgstAmount)}
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>SGST Amount</div>
                  <div className={styles.summaryValue}>
                    {formatCurrency(gstr1.b2csSummary.sgstAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📋 Document Summary</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Total Invoices Issued</div>
                <div className={`${styles.summaryValue} ${styles.summaryValueSuccess}`}>
                  {gstr1.documentSummary.totalInvoicesIssued}
                </div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>From Invoice</div>
                <div className={styles.summaryValue}>{gstr1.documentSummary.fromInvoiceNo}</div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>To Invoice</div>
                <div className={styles.summaryValue}>{gstr1.documentSummary.toInvoiceNo}</div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Cancelled Invoices</div>
                <div className={`${styles.summaryValue} ${styles.summaryValueWarning}`}>
                  {gstr1.documentSummary.cancelledCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGstr3bTab = () => {
    if (!gstr3b) return null;

    const renderTaxComponent = (title: string, component: { taxableValue: number; igst: number; cgst: number; sgst: number; cess: number }) => (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{title}</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.taxBreakdown}>
            <div className={styles.taxItem}>
              <div className={styles.taxItemLabel}>Taxable Value</div>
              <div className={styles.taxItemValue}>{formatCurrency(component.taxableValue)}</div>
            </div>
            <div className={styles.taxItem}>
              <div className={styles.taxItemLabel}>IGST</div>
              <div className={styles.taxItemValue}>{formatCurrency(component.igst)}</div>
            </div>
            <div className={styles.taxItem}>
              <div className={styles.taxItemLabel}>CGST</div>
              <div className={styles.taxItemValue}>{formatCurrency(component.cgst)}</div>
            </div>
            <div className={styles.taxItem}>
              <div className={styles.taxItemLabel}>SGST</div>
              <div className={styles.taxItemValue}>{formatCurrency(component.sgst)}</div>
            </div>
            <div className={styles.taxItem}>
              <div className={styles.taxItemLabel}>Cess</div>
              <div className={styles.taxItemValue}>{formatCurrency(component.cess)}</div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className={styles.gstr3bSection}>
        <div className={styles.shopInfo}>
          <div className={styles.shopInfoItem}>
            <span className={styles.shopInfoLabel}>Legal Name</span>
            <span className={styles.shopInfoValue}>{gstr3b.legalName}</span>
          </div>
          <div className={styles.shopInfoItem}>
            <span className={styles.shopInfoLabel}>GSTIN</span>
            <span className={styles.shopInfoValue}>{gstr3b.gstin}</span>
          </div>
          <div className={styles.shopInfoItem}>
            <span className={styles.shopInfoLabel}>Return Period</span>
            <span className={styles.shopInfoValue}>{gstr3b.period}</span>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>📤 Outward Supplies</h2>
        {renderTaxComponent('Taxable Supplies', gstr3b.outwardSupplies.taxableSupplies)}
        {renderTaxComponent('Zero Rated Supplies', gstr3b.outwardSupplies.zeroRatedSupplies)}
        {renderTaxComponent('Nil Rated Supplies', gstr3b.outwardSupplies.nilRatedSupplies)}
        {renderTaxComponent('Reverse Charge Supplies', gstr3b.outwardSupplies.reverseChargeSupplies)}
        {renderTaxComponent('Non-GST Supplies', gstr3b.outwardSupplies.nonGstSupplies)}

        <h2 className={styles.sectionTitle}>📥 Input Tax Credit</h2>
        {renderTaxComponent('ITC Available', gstr3b.inputTaxCredit.itcAvailable)}
        {renderTaxComponent('ITC Reversed', gstr3b.inputTaxCredit.itcReversed)}
        {renderTaxComponent('Net ITC', gstr3b.inputTaxCredit.netItc)}
        {renderTaxComponent('Ineligible ITC', gstr3b.inputTaxCredit.ineligibleItc)}

        <h2 className={styles.sectionTitle}>🔄 Exempt Supplies</h2>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Inter-State Supplies</div>
                <div className={styles.summaryValue}>
                  {formatCurrency(gstr3b.exemptSupplies.interStateSupplies)}
                </div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Intra-State Supplies</div>
                <div className={styles.summaryValue}>
                  {formatCurrency(gstr3b.exemptSupplies.intraStateSupplies)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.taxPaymentSummary}>
          <h3 className={styles.taxPaymentTitle}>💰 Tax Payment Summary</h3>
          <div className={styles.taxPaymentGrid}>
            <div className={styles.taxPaymentItem}>
              <div className={styles.taxPaymentLabel}>IGST Payable</div>
              <div className={styles.taxPaymentValue}>
                {formatCurrency(gstr3b.taxPayment.igstPayable)}
              </div>
            </div>
            <div className={styles.taxPaymentItem}>
              <div className={styles.taxPaymentLabel}>CGST Payable</div>
              <div className={styles.taxPaymentValue}>
                {formatCurrency(gstr3b.taxPayment.cgstPayable)}
              </div>
            </div>
            <div className={styles.taxPaymentItem}>
              <div className={styles.taxPaymentLabel}>SGST Payable</div>
              <div className={styles.taxPaymentValue}>
                {formatCurrency(gstr3b.taxPayment.sgstPayable)}
              </div>
            </div>
            <div className={styles.taxPaymentItem}>
              <div className={styles.taxPaymentLabel}>Cess Payable</div>
              <div className={styles.taxPaymentValue}>
                {formatCurrency(gstr3b.taxPayment.cessPayable)}
              </div>
            </div>
            <div className={`${styles.taxPaymentItem} ${styles.taxPaymentTotal}`}>
              <div className={styles.taxPaymentLabel}>Total Payable</div>
              <div className={styles.taxPaymentValue}>
                {formatCurrency(gstr3b.taxPayment.totalPayable)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReturnsTab = () => {
    return (
      <div className={styles.gstr3bSection}>
        <div className={styles.actionButtons}>
          <button
            className={styles.generateButton}
            onClick={() => handleGenerateReturn('GSTR1')}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '📄 Generate GSTR-1'}
          </button>
          <button
            className={styles.generateButton}
            onClick={() => handleGenerateReturn('GSTR3B')}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '📄 Generate GSTR-3B'}
          </button>
        </div>

        <h2 className={styles.sectionTitle}>📁 Generated Returns</h2>

        {returns && returns.returns.length > 0 ? (
          <div className={styles.returnsList}>
            {returns.returns.map((ret: GstReturn) => (
              <div key={ret.id} className={styles.returnItem}>
                <div className={styles.returnInfo}>
                  <span className={styles.returnType}>{ret.returnType}</span>
                  <span className={styles.returnPeriod}>
                    Period: {formatPeriodDisplay(ret.period)} • Created:{' '}
                    {new Date(ret.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className={styles.returnMeta}>
                  <span className={styles.returnAmount}>
                    {formatCurrency(ret.totalTaxLiability)}
                  </span>
                  <span className={`${styles.statusBadge} ${getStatusClass(ret.status)}`}>
                    {ret.status}
                  </span>
                  {ret.status === 'GENERATED' && (
                    <button
                      className={styles.fileButton}
                      onClick={() => handleMarkAsFiled(ret.id)}
                      disabled={filing === ret.id}
                    >
                      {filing === ret.id ? '⏳ Filing...' : '✅ Mark as Filed'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📋</div>
            <div className={styles.emptyStateText}>No returns generated yet</div>
            <div className={styles.emptyStateSubtext}>
              Generate GSTR-1 or GSTR-3B returns using the buttons above
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>🧾</span>
          GST Tax Filing
        </h1>
        <p className={styles.subtitle}>
          Generate and manage GSTR-1 and GSTR-3B returns for GST compliance
        </p>
      </div>

      <div className={styles.periodSelector}>
        <div className={styles.periodGroup}>
          <label>Tax Period</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={styles.periodInput}
          />
        </div>
        <button className={styles.loadButton} onClick={loadData} disabled={loading}>
          {loading ? '⏳ Loading...' : '🔄 Load Data'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'summary' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'gstr1' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('gstr1')}
        >
          GSTR-1
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'gstr3b' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('gstr3b')}
        >
          GSTR-3B
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'returns' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('returns')}
        >
          Returns
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <div>Loading GST data...</div>
        </div>
      ) : (
        <>
          {activeTab === 'summary' && renderSummaryTab()}
          {activeTab === 'gstr1' && renderGstr1Tab()}
          {activeTab === 'gstr3b' && renderGstr3bTab()}
          {activeTab === 'returns' && renderReturnsTab()}
        </>
      )}
    </div>
  );
}

export default GstTaxFiling;


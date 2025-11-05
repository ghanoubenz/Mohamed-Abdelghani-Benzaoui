import React, { useState, useMemo } from 'react';
import { StoredLead } from '../types';

interface AllLeadsViewProps {
  leads: StoredLead[];
  onBack: () => void;
}

const LeadDetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-200/50 last:border-b-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 col-span-2 sm:mt-0">{value}</dd>
        </div>
    );
};

export const AllLeadsView: React.FC<AllLeadsViewProps> = ({ leads, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;
    const lowercasedFilter = searchTerm.toLowerCase();
    return leads.filter(lead =>
      lead.name.toLowerCase().includes(lowercasedFilter) ||
      lead.company.toLowerCase().includes(lowercasedFilter) ||
      lead.email.toLowerCase().includes(lowercasedFilter)
    );
  }, [leads, searchTerm]);

  const toggleExpand = (leadId: string) => {
    setExpandedLeadId(prevId => (prevId === leadId ? null : leadId));
  };

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
             <button onClick={onBack} className="text-gray-500 hover:text-gray-800 p-2 text-lg rounded-full bg-white/30 hover:bg-white/60 transition-colors">&larr; Back</button>
             <h2 className="text-2xl font-bold text-gray-800 text-center flex-grow">All Captured Leads</h2>
             <div className="w-20"></div> {/* Spacer */}
        </div>
      
        <div className="mb-4">
            <input
                type="text"
                placeholder="Search by name, company, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent sm:text-sm bg-white/70"
            />
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 p-1">
            {filteredLeads.length === 0 ? (
                <div className="text-center text-gray-500 mt-8 p-4 bg-white/30 rounded-lg">
                    <p>No leads found.</p>
                </div>
            ) : (
                filteredLeads.map(lead => (
                    <div key={lead.id} className="bg-white/40 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                        <div
                            onClick={() => toggleExpand(lead.id)}
                            className="p-4 cursor-pointer flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-semibold text-gray-800">{lead.name}</h3>
                                <p className="text-sm text-gray-500">{lead.company}</p>
                            </div>
                            <div className="text-right flex items-center">
                               <p className="text-xs text-gray-400 mr-3">
                                    {new Date(lead.timestamp).toLocaleDateString()}
                                </p>
                                <span className={`transform transition-transform duration-200 text-gray-400 ${expandedLeadId === lead.id ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </div>
                        </div>
                        {expandedLeadId === lead.id && (
                            <div className="p-4 border-t border-gray-200/80 bg-white/20 animate-fade-in">
                                <dl>
                                    <LeadDetailRow label="Email" value={lead.email} />
                                    <LeadDetailRow label="Phone" value={lead.phone} />
                                    <LeadDetailRow label="Country" value={lead.country} />
                                    <LeadDetailRow label="Interest" value={lead.interest} />
                                    <LeadDetailRow label="Notes" value={lead.notes} />
                                    <LeadDetailRow label="Event" value={lead.event} />
                                    <LeadDetailRow label="Source" value={lead.source} />
                                    <LeadDetailRow label="Registrar" value={lead.registrar} />
                                    <LeadDetailRow label="Entry Type" value={lead.scanType} />
                                    <LeadDetailRow label="Date" value={new Date(lead.timestamp).toLocaleString()} />
                                </dl>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
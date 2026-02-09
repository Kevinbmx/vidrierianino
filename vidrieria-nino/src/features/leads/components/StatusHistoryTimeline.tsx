import React from 'react';
import { LeadStatusHistory, STATUS_LABELS } from '../types';

interface StatusHistoryTimelineProps {
    history?: LeadStatusHistory[];
}

export const StatusHistoryTimeline = ({ history }: StatusHistoryTimelineProps) => {
    if (!history || history.length === 0) {
        return <div className="text-gray-500 text-sm py-4">No hay historial disponible.</div>;
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {history.map((event, eventIdx) => (
                    <li key={event.id}>
                        <div className="relative pb-8">
                            {eventIdx !== history.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                        {/* Simple dot for now, could be icon based on status */}
                                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Cambio a <span className="font-medium text-gray-900">{STATUS_LABELS[event.to_status]}</span>
                                            {event.from_status && (
                                                <span className="text-gray-400 text-xs ml-1">
                                                    (desde {STATUS_LABELS[event.from_status]})
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            por {event.user_name}
                                        </p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                        <time dateTime={event.created_at}>
                                            {new Date(event.created_at).toLocaleString()}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

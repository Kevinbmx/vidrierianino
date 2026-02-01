export interface ProjectSpec {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}

export interface ProjectReview {
    text: string;
    author: string;
    rating: number;
}

export interface Project {
    id: number;
    category: string;
    title: string;
    shortDescription: string;
    fullDescription: string;
    images: string[];
    specs: {
        glass: string;
        profile: string;
        location: string;
        warranty: string;
    };
    review?: ProjectReview;
}

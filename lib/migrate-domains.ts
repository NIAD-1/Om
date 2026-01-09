// Domain Migration Utility
// Auto-assigns domains to old curricula based on field names

export function migrateCurriculaDomains() {
    const curricula = JSON.parse(localStorage.getItem('curricula') || '[]');
    let migrated = 0;

    const updated = curricula.map((curriculum: any) => {
        if (curriculum.domain) return curriculum; // Already has domain

        // Smart categorization based on field name
        const field = curriculum.field.toLowerCase();
        let domain = 'other'; // default

        // Technology keywords
        if (field.includes('sql') || field.includes('machine learning') ||
            field.includes('programming') || field.includes('coding') ||
            field.includes('software') || field.includes('web') ||
            field.includes('data') || field.includes('ai') || field.includes('ml') ||
            field.includes('javascript') || field.includes('python') || field.includes('tech')) {
            domain = 'technology';
        }
        // Finance keywords
        else if (field.includes('finance') || field.includes('trading') ||
            field.includes('investment') || field.includes('stock') ||
            field.includes('money') || field.includes('accounting')) {
            domain = 'finance';
        }
        // Business keywords
        else if (field.includes('business') || field.includes('management') ||
            field.includes('marketing') || field.includes('strategy') ||
            field.includes('entrepreneurship')) {
            domain = 'business';
        }
        // Sciences keywords
        else if (field.includes('biology') || field.includes('chemistry') ||
            field.includes('physics') || field.includes('science') ||
            field.includes('molecular') || field.includes('genetics')) {
            domain = 'sciences';
        }
        // Arts keywords
        else if (field.includes('art') || field.includes('design') ||
            field.includes('music') || field.includes('writing') ||
            field.includes('creative')) {
            domain = 'arts';
        }
        // History and other topics
        else if (field.includes('history') || field.includes('war') ||
            field.includes('world')) {
            domain = 'other';
        }

        if (!curriculum.domain) {
            migrated++;
            return { ...curriculum, domain };
        }
        return curriculum;
    });

    localStorage.setItem('curricula', JSON.stringify(updated));
    return migrated;
}

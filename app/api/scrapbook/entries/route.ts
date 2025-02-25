import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const email = searchParams.get('email');
    const limit = 10;

    if (!email || !supabaseAdmin) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
        const { data: entries, error } = await supabaseAdmin
            .from('scrapbook_entries')
            .select(`
                id,
                title,
                content,
                created_at,
                poster,
                poster_email,
                entry_date
            `)
            .or(`poster_email.eq.${email},poster.eq.${email === 'amherring11@gmail.com' ? 'abby' : 'sellers'}`)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return NextResponse.json({ 
            entries: entries.map(entry => ({
                id: entry.id,
                title: entry.title,
                content: entry.content,
                createdAt: entry.created_at,
                poster: entry.poster,
                posterEmail: entry.poster_email
            }))
        });
    } catch (error) {
        console.error('Error fetching entries:', error);
        return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json() as {
        title: string;
        content: string;
        entry_date: string;
        image_url: string;
        tags: string[];
        submitted_by: string;
    };
    const { title, content, entry_date, image_url, tags, submitted_by } = body;

    const { data, error } = await supabase
        .from('scrapbook_entries')
        .insert([{ title, content, entry_date, image_url, tags, submitted_by }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

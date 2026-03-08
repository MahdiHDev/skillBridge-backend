import { prisma } from "../../lib/prisma";

const createSubject = async (subject: string) => {
    const subjectSlug = subject.toLowerCase().replace(/\s+/g, "-");

    return await prisma.subject.create({
        data: {
            name: subject,
            slug: subjectSlug,
        },
    });
};

const getAllSubjects = async () => {
    return await prisma.subject.findMany();
};

const updateSubject = async (id: string, subject: string) => {
    const subjectSlug = subject.toLowerCase().replace(/\s+/g, "-");

    return await prisma.subject.update({
        where: {
            id,
        },
        data: {
            name: subject,
            slug: subjectSlug,
        },
    });
};

const deleteSubject = async (id: string) => {
    return await prisma.subject.delete({
        where: { id },
    });
};

export const SubjectService = {
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject,
};

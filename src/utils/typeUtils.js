/**
 * Type information and constants for the application
 * Contains field types, statuses, priorities, and other type-related constants
 */

// Field type definitions for form validation and display
export const TypeInfo = {
  // Task-related types
  task: {
    statuses: ['Todo', 'In Progress', 'Done'],
    priorities: ['Low', 'Medium', 'High', 'Urgent'],
    fieldTypes: {
      title: 'Text',
      description: 'MultilineText',
      dueDate: 'Date',
      priority: 'Picklist',
      status: 'Picklist',
      assignee: 'Text',
      tags: 'Tag'
    }
  },
  // Project-related types
  project: {
    fieldTypes: {
      name: 'Text',
      description: 'MultilineText',
      color: 'Text'
    }
  }
};
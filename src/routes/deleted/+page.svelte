<script>
	import Todo from '$lib/components/todo-list.svelte';
	import { derived } from 'svelte/store';

	/** @type {import('./$types').PageData} */
	let { data } = $props();
	let user = $derived(data.user);
	let todoListDeleted = $derived(data.cloud_posts?.filter(t => t.deleted));
</script>

<style>
    @import '$lib/styles.css';
</style>

<div class="centered">

	<h2>Deleted TODOs:</h2>
	<a href="/">Return to Main Page</a>
	<hr>
	<Todo todos={todoListDeleted} isDeletedListPage={true} />

</div>

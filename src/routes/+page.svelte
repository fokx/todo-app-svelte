<script>
	let newItem = $state('');

	let todoList = $state([{ text: 'My undone TODO 1', done: false },
		{ text: 'My undone TODO 2', done: false },
		{ text: 'My done TODO 1', done: true },
		{ text: 'My done TODO 2', done: true }
	]);

	function addToList() {
		todoList = [...todoList, { text: newItem, done: false }];
		newItem = '';
	}
	function deleteCompleted() {
		if (window.confirm("Do you really want to delete all completed TODOs?")) {
			todoList = todoList.filter(t => !t.done);
		}
	}


	function removeFromList(index) {
		todoList.splice(index, 1);
	}

	// This is recomputed when the todos array changes.
	let uncompletedCount = $derived(todoList.filter(t => !t.done).length);
	let status = $derived(`${uncompletedCount} out of ${todoList.length} remaining`);

</script>

<div class="main">
	<h3>My TODO list</h3>
	<p>{status}</p>
	<input bind:value={newItem} type="text" placeholder="new todo item..">
	<button onclick={addToList} disabled={!newItem}>Add</button>
	<button onclick={deleteCompleted}>Delete all completed</button>
	<br />
	{#each todoList as item, index}
		<input bind:checked={item.done} type="checkbox">
		<span class:checked={item.done}>{item.text}</span>
		<button onclick={() => removeFromList(index)}>❌</button>
		<br />
	{/each}
</div>


<style>
    .checked {
        text-decoration: line-through;
    }

    .main {
        /*display: flex;*/
        /*align-items: center;*/
    }
</style>